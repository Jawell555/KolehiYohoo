<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user (Student or Institution).
     */
    public function register(Request $request)
    {
        $roleInput = strtolower($request->input('role', 'student'));

        if ($roleInput === 'institution') {
            return $this->registerInstitution($request);
        }

        return $this->registerStudent($request);
    }

    /**
     * Register a Student.
     */
    protected function registerStudent(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string|max:500',
            'school_name' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated) {
            // Student role is role_id = 1
            $roleId = 1;

            $user = User::create([
                'email' => $validated['email'],
                'hash_password' => Hash::make($validated['password']),
                'role_id' => $roleId,
                'is_active' => true,
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'address' => $validated['address'] ?? null,
                'school_name' => $validated['school_name'] ?? null,
            ]);

            return response()->json([
                'message' => 'Student registered successfully',
                'token' => null,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => 'student',
                    'name' => "{$student->first_name} {$student->last_name}",
                    'student' => $student,
                ],
            ], 201);
        });
    }

    /**
     * Register an Institution.
     */
    protected function registerInstitution(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:6',
            'school_name' => 'nullable|string|max:255',
            'institution_name' => 'nullable|string|max:255',
            'rep_name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'contact_no' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        // Generate random secure password if not provided in verification request
        $password = $validated['password'] ?? \Illuminate\Support\Str::random(32);
        $institutionName = $validated['institution_name'] ?? $validated['school_name'] ?? 'Partner Institution';
        $contactNo = $validated['contact_no'] ?? $validated['phone'] ?? null;
        $address = $validated['address'] ?? $validated['notes'] ?? null;

        $firstName = $validated['first_name'] ?? null;
        $lastName = $validated['last_name'] ?? null;

        if (!$firstName && !empty($validated['rep_name'])) {
            $parts = explode(' ', trim($validated['rep_name']), 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? '';
        }

        return DB::transaction(function () use ($validated, $password, $institutionName, $contactNo, $address, $firstName, $lastName) {
            // Institution role is role_id = 2
            $roleId = 2;

            $user = User::create([
                'email' => $validated['email'],
                'hash_password' => Hash::make($password),
                'role_id' => $roleId,
                'is_active' => true,
            ]);

            $institution = Institution::create([
                'user_id' => $user->id,
                'institution_name' => $institutionName,
                'contact_no' => $contactNo,
                'address' => $address,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'is_approved' => false,
            ]);

            return response()->json([
                'message' => 'Institution registered successfully',
                'token' => null,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => 'institution',
                    'name' => $institution->institution_name,
                    'institution' => $institution,
                ],
            ], 201);
        });
    }

    /**
     * Log in specifically as a Student.
     */
    public function loginStudent(Request $request)
    {
        $request->merge(['role' => 'student', 'role_id' => 1]);
        return $this->login($request);
    }

    /**
     * Log in specifically as an Institution.
     */
    public function loginInstitution(Request $request)
    {
        $request->merge(['role' => 'institution', 'role_id' => 2]);
        return $this->login($request);
    }

    /**
     * Log in user (handles Student, Institution, Admin).
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'role' => 'nullable|string',
            'role_id' => 'nullable|integer',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->hash_password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        if ($user->is_active === false) {
            return response()->json([
                'message' => 'This account has been deactivated. Please contact support.',
            ], 403);
        }

        $user->load(['role', 'student', 'institution', 'admin']);
        $roleName = $user->role_name;

        // Check if pending institution approval
        if ($roleName === 'institution' && $user->institution && !$user->institution->is_approved) {
            return response()->json([
                'message' => 'Your institution account is pending verification and approval by administrators.',
            ], 403);
        }

        // Enforce role matching if a specific role or role_id was requested
        if (!empty($validated['role'])) {
            $expectedRole = strtolower($validated['role']);
            if (strtolower($roleName) !== $expectedRole) {
                $article = in_array(strtolower($roleName)[0], ['a', 'e', 'i', 'o', 'u']) ? 'an' : 'a';
                return response()->json([
                    'message' => "Unauthorized. This account is registered as {$article} {$roleName} and cannot log in through the {$expectedRole} portal.",
                ], 403);
            }
        }

        if (!empty($validated['role_id'])) {
            $expectedRoleId = (int) $validated['role_id'];
            if ((int) $user->role_id !== $expectedRoleId) {
                $article = in_array(strtolower($roleName)[0], ['a', 'e', 'i', 'o', 'u']) ? 'an' : 'a';
                return response()->json([
                    'message' => "Unauthorized. This account is registered as {$article} {$roleName}.",
                ], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified' => !is_null($user->email_verified_at),
                'phone' => $user->student?->contact_no ?? $user->institution?->contact_no,
                'role_id' => $user->role_id,
                'role' => $roleName,
                'name' => $user->display_name,
                'student' => $user->student,
                'institution' => $user->institution,
                'admin' => $user->admin,
            ],
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['role', 'student', 'institution', 'admin']);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified' => !is_null($user->email_verified_at),
                'phone' => $user->student?->contact_no ?? $user->institution?->contact_no,
                'role_id' => $user->role_id,
                'role' => $user->role_name,
                'name' => $user->display_name,
                'student' => $user->student,
                'institution' => $user->institution,
                'admin' => $user->admin,
            ],
        ]);
    }

    /**
     * Update authenticated user profile in the database.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Only validate email uniqueness if email was actually submitted and changed
        $rules = [
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'school_name' => 'nullable|string|max:255',
            'contact_no' => ['nullable', 'string', 'regex:/^09[0-9]{9}$/'],
            'phone' => ['nullable', 'string', 'regex:/^09[0-9]{9}$/'],
            'institution_name' => 'nullable|string|max:255',
        ];

        $messages = [
            'contact_no.regex' => 'Enter a valid phone number!',
            'phone.regex' => 'Enter a valid phone number!',
        ];

        if ($request->filled('email') && strtolower($request->email) !== strtolower($user->email)) {
            $rules['email'] = 'required|string|email|max:255|unique:users,email,' . $user->id;
        }

        $validated = $request->validate($rules, $messages);

        // Update email on users table if changed
        if (!empty($validated['email']) && strtolower($validated['email']) !== strtolower($user->email)) {
            $user->email = $validated['email'];
            $user->email_verified_at = null; // Re-verification required
            $user->save();
        }

        // Update student profile directly on students table
        $student = $user->student;
        if ($user->role_id == 1 || $student) {
            $studentData = [];
            if (isset($validated['first_name'])) $studentData['first_name'] = $validated['first_name'];
            if (isset($validated['last_name'])) $studentData['last_name'] = $validated['last_name'];
            if (isset($validated['address'])) $studentData['address'] = $validated['address'];
            if (isset($validated['school_name'])) $studentData['school_name'] = $validated['school_name'];
            if (isset($validated['contact_no'])) $studentData['contact_no'] = $validated['contact_no'];
            elseif (isset($validated['phone'])) $studentData['contact_no'] = $validated['phone'];

            if (!empty($studentData)) {
                if ($student) {
                    $student->update($studentData);
                } else {
                    $student = Student::create(array_merge(['user_id' => $user->id], $studentData));
                    $user->setRelation('student', $student);
                }
            }
        }

        // Update institution profile directly on institutions table if applicable
        $institution = $user->institution;
        if ($user->role_id == 2 || $institution) {
            $instData = [];
            if (isset($validated['institution_name'])) $instData['institution_name'] = $validated['institution_name'];
            if (isset($validated['first_name'])) $instData['first_name'] = $validated['first_name'];
            if (isset($validated['last_name'])) $instData['last_name'] = $validated['last_name'];
            if (isset($validated['address'])) $instData['address'] = $validated['address'];
            if (isset($validated['contact_no'])) $instData['contact_no'] = $validated['contact_no'];
            elseif (isset($validated['phone'])) $instData['contact_no'] = $validated['phone'];

            if (!empty($instData)) {
                if ($institution) {
                    $institution->update($instData);
                } else {
                    $institution = Institution::create(array_merge(['user_id' => $user->id], $instData));
                    $user->setRelation('institution', $institution);
                }
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified' => !is_null($user->email_verified_at),
                'phone' => $student?->contact_no ?? $institution?->contact_no,
                'role_id' => $user->role_id,
                'role' => $user->role_name,
                'name' => $user->display_name,
                'student' => $student,
                'institution' => $institution,
                'admin' => $user->admin,
            ],
        ]);
    }

    /**
     * Change account password in users table.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if (!Hash::check($validated['current_password'], $user->hash_password)) {
            return response()->json([
                'message' => 'Current password does not match our records.',
            ], 422);
        }

        $user->hash_password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully in database.',
        ]);
    }

    /**
     * Verify email and record timestamp in users table.
     */
    public function verifyEmail(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json([
            'message' => 'Email verified successfully',
            'email_verified_at' => $user->email_verified_at,
        ]);
    }

    /**
     * Logout and revoke tokens.
     */
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }
}
