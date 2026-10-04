<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SavedUniversityController extends Controller
{
    /**
     * List the authenticated student's saved universities.
     */
    public function index(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['data' => []]);
        }

        $ids = DB::table('saved_universities')
            ->where('student_id', $student->student_id)
            ->pluck('university_id');

        $universities = University::withCount('courses')
            ->whereIn('university_id', $ids)
            ->orderBy('name')
            ->get()
            ->map(fn (University $u) => $u->toApiArray())
            ->values();

        return response()->json(['data' => $universities]);
    }

    /**
     * Save a university for the authenticated student.
     */
    public function store(Request $request, int $id)
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Only student accounts can save schools.'], 403);
        }

        if (!University::whereKey($id)->exists()) {
            return response()->json(['message' => 'University not found'], 404);
        }

        DB::table('saved_universities')->insertOrIgnore([
            'student_id' => $student->student_id,
            'university_id' => $id,
        ]);

        return response()->json(['message' => 'School saved', 'university_id' => $id], 201);
    }

    /**
     * Remove a saved university for the authenticated student.
     */
    public function destroy(Request $request, int $id)
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Only student accounts can save schools.'], 403);
        }

        DB::table('saved_universities')
            ->where('student_id', $student->student_id)
            ->where('university_id', $id)
            ->delete();

        return response()->json(['message' => 'School removed', 'university_id' => $id]);
    }
}
