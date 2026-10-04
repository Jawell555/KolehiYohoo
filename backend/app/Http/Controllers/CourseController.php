<?php

namespace App\Http\Controllers;

use App\Models\Course;

class CourseController extends Controller
{
    /**
     * All courses that are offered by at least one university.
     * Used to populate the course search dropdown.
     */
    public function index()
    {
        $courses = Course::query()
            ->with('category')
            ->whereHas('universities')
            ->withCount('universities')
            ->orderBy('course_name')
            ->get()
            ->map(fn (Course $c) => $c->toApiArray() + ['university_count' => $c->universities_count])
            ->values();

        return response()->json(['data' => $courses]);
    }
}
