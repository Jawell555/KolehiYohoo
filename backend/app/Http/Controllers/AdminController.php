<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Institution;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Get system statistics for the admin dashboard.
     */
    public function stats()
    {
        return response()->json([
            'total_schools' => University::count(),
            'total_courses' => Course::count(),
            'pending_requests' => Institution::where('is_approved', false)->count(),
        ]);
    }

    /**
     * List all pending institution verification requests.
     */
    public function pendingInstitutions()
    {
        $pending = Institution::with('user:id,email,created_at')
            ->where('is_approved', false)
            ->orderBy('institution_id', 'desc')
            ->get();

        return response()->json(['data' => $pending]);
    }

    /**
     * Approve a pending institution and link/create university record.
     */
    public function approveInstitution(Request $request, int $id)
    {
        $institution = Institution::with('user')->find($id);
        if (!$institution) {
            return response()->json(['message' => 'Institution not found.'], 404);
        }
        if ($institution->is_approved) {
            return response()->json(['message' => 'Institution already approved.'], 400);
        }

        DB::transaction(function () use ($institution, $request) {
            // 1. Mark institution as approved
            $institution->is_approved = true;
            $institution->save();

            // 1b. Update password if admin set a temporary password
            if ($request->filled('temp_password') && $institution->user) {
                $institution->user->hash_password = Hash::make($request->temp_password);
                $institution->user->save();
            }

            // 2. Check if university with a matching name already exists to claim it
            $university = University::where('name', 'ILIKE', $institution->institution_name)->first();

            if ($university) {
                $university->institution_id = $institution->institution_id;
                if ($institution->address && empty($university->address)) {
                    $university->address = $institution->address;
                }
                $university->save();
            } else {
                University::create([
                    'institution_id' => $institution->institution_id,
                    'name' => $institution->institution_name,
                    'abbreviation' => $institution->institution_name,
                    'institution_type' => 'Private',
                    'address' => $institution->address,
                ]);
            }
        });

        return response()->json([
            'message' => "Institution '{$institution->institution_name}' has been approved successfully.",
        ]);
    }

    /**
     * Reject and delete a pending application.
     */
    public function rejectInstitution(int $id)
    {
        $institution = Institution::with('user')->find($id);
        if (!$institution) {
            return response()->json(['message' => 'Institution not found.'], 404);
        }

        DB::transaction(function () use ($institution) {
            $user = $institution->user;
            $institution->delete();
            if ($user) {
                $user->delete();
            }
        });

        return response()->json(['message' => 'Institution application rejected and removed.']);
    }

    /**
     * Update school / university details.
     */
    public function updateUniversity(Request $request, int $id)
    {
        $university = University::find($id);
        if (!$university) {
            return response()->json(['message' => 'University not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'nullable|string|max:50',
            'institution_type' => 'required|string|max:100',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|string|max:255',
            'graduate_programs' => 'nullable|string|max:2000',
        ]);

        $university->update($validated);

        return response()->json([
            'message' => 'University details updated successfully.',
            'data' => $university->toApiArray(),
        ]);
    }
}
