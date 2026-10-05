<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\University;
use Illuminate\Http\Request;

class InstitutionPortalController extends Controller
{
    //Get university profile that belongs to the authenticated institution.
    public function mySchool(Request $request){
        $institution = $request->user()->institution;

        if(!$institution || !$institution->is_approved){
            return response()->json(['message'=>'Approved institution account required.'], 403);
        }
        $university  = University::with('courses.category')
        ->where('institution_id', $institution->institution_id)
        ->first();

        if(!$university){
            return response()->json(['message'=>'No university record linked to this institution yet.',
            'university'=>null]);
        }

        return response()->json([
            'institution' => $institution,
            'university'  => $university->toApiArray(),
        ]);
    }

    //Update school profile info (website , address, contact, tuitioon).

    public function updateSchool(Request $request){
        $institution = $request->user()->institution;

        if(!$institution || !$institution->is_approved){
            return response()->json(['message'=>'Approved institution account required.'], 403);
        }

        $university = University::where('institution_id', $institution->institution_id)->first();

        if(!$university){
            return response()->json(['message'=>
            'No university record linked to this institution yet. Contact admin to create a university.'
        ],404);
        }

        $validated = $request->validate([
            'website' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'abbreviation' => 'nullable|string|max:50',
            'institution_type' => 'nullable|string|max:100',
            'graduate_programs' => 'nullable|string',
        ]);

        $university->update(array_filter($validated, fn($v) => !is_null($v)));

        return response()->json([
            'message'=>'School profile updated successfully.',
            'university'=> $university->fresh('courses.category')->toApiArray(),
        ]);
    }

    //Add a course to this university's offerings.
    public function addCourse(Request $request){
        $institution = $request->user()->institution;
        $university = University::where('institution_id', $institution->institution_id)->firstOrFail();

        $validated = $request->validate([
            'course_id'=>'required|integer|exists:courses,course_id',
        ]);

        //No duplicate
        $university->courses()->syncWithoutDetaching([$validated['course_id']]);

        return response()->json([
            'message'=>'Course added successfully.',
            'university' => $university->fresh('courses.category')->toApiArray()['courses'],
        ]);

    }

    //Remove a course from uni
    public function removeCourse(Request $request, int $courseId){
        $institution = $request->user()->institution;
        $university = University::where('institution_id', $institution->institution_id)->firstOrFail();

        $university ->courses()->detach($courseId);

        return response()-> json([
            'message'=>'Program removed from offering',
            'courses'=> $university->fresh('courses.category')->toApiArray()['courses'],
        ]);
    }


}
