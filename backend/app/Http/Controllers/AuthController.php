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
            // Find or use role_id = 1 for student
            $studentRole = Role::where('role_name', 'student')->first();
            $roleId = $studentRole ? $studentRole->id : 1;

            $user = User::create([
                'email' => $validated['email'],
                'hash_password' => Hash::make($validated['password']),
                'role_id' => $roleId,
                'is_active' => true,
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'f_name' => $validated['first_name'],
                'l_name' => $validated['last_name'],
                'address' => $validated['address'] ?? null,
                'school_name' => $validated['school_name'] ?? null,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Student registered successfully',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => 'student',
                    'name' => "{$student->f_name} {$student->l_name}",
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

        // Default password if not provided in verification request
        $password = $validated['password'] ?? 'KolehiYohoo!2026';
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
            $instRole = Role::where('role_name', 'institution')->first();
            $roleId = $instRole ? $instRole->id : 2;

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

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Institution registered successfully',
                'token' => $token,
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

        $user = User::with(['role', 'student', 'institution', 'admin'])
            ->where('email', $validated['email'])
            ->first();

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

        // Determine user role and formatted display name
        $roleName = $user->role ? $user->role->role_name : match ($user->role_id) {
            1 => 'student',
            2 => 'institution',
            3 => 'admin',
            default => 'student',
        };

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

        $displayName = $user->email;
        if ($roleName === 'student' && $user->student) {
            $displayName = trim("{$user->student->f_name} {$user->student->l_name}");
        } elseif ($roleName === 'institution' && $user->institution) {
            $displayName = $user->institution->institution_name ?: $user->email;
        } elseif ($roleName === 'admin' && $user->admin) {
            $displayName = $user->admin->name ?: $user->email;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $roleName,
                'name' => $displayName,
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

        $roleName = $user->role ? $user->role->role_name : match ($user->role_id) {
            1 => 'student',
            2 => 'institution',
            3 => 'admin',
            default => 'student',
        };

        $displayName = $user->email;
        if ($roleName === 'student' && $user->student) {
            $displayName = trim("{$user->student->f_name} {$user->student->l_name}");
        } elseif ($roleName === 'institution' && $user->institution) {
            $displayName = $user->institution->institution_name ?: $user->email;
        } elseif ($roleName === 'admin' && $user->admin) {
            $displayName = $user->admin->name ?: $user->email;
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $roleName,
                'name' => $displayName,
                'student' => $user->student,
                'institution' => $user->institution,
                'admin' => $user->admin,
            ],
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
