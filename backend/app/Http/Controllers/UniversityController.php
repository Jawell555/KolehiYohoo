<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\University;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    /**
     * List universities, optionally filtered.
     *
     * Query params:
     *  - course_id: exact course (selected from the dropdown)
     *  - course:    free-text course search (name or code, e.g. "BSIT", "BS Computer Science")
     *  - location:  free-text location search against address / name (accent-insensitive, "Binan" == "Biñan")
     *  - type:      "public" or "private" (matches the start of institution_type; anything else = both)
     */
    public function index(Request $request)
    {
        $query = University::query()->withCount('courses')->orderBy('name');

        $courseId = $request->integer('course_id');
        $courseText = trim((string) $request->query('course', ''));
        $location = trim((string) $request->query('location', ''));
        $type = strtolower(trim((string) $request->query('type', '')));

        if ($courseId > 0) {
            $query->whereHas('courses', fn ($q) => $q->where('courses.course_id', $courseId));
        } elseif ($courseText !== '') {
            $patterns = Course::searchPatterns($courseText);
            $query->whereHas('courses', function ($q) use ($patterns) {
                $q->where(function ($w) use ($patterns) {
                    foreach ($patterns as $p) {
                        $w->orWhere('courses.course_name', 'ILIKE', '%' . Course::escapeLike($p) . '%');
                    }
                });
            });
        }

        if (in_array($type, ['public', 'private'], true)) {
            $query->where('institution_type', 'ILIKE', $type . '%');
        }

        if ($location !== '') {
            $loc = '%' . Course::escapeLike($this->normalizeText($location)) . '%';
            $query->where(function ($w) use ($loc) {
                $w->whereRaw("translate(lower(coalesce(address, '')), 'ñÑ', 'nn') LIKE ?", [$loc])
                    ->orWhereRaw("translate(lower(name), 'ñÑ', 'nn') LIKE ?", [$loc]);
            });
        }

        return response()->json([
            'data' => $query->get()->map(fn (University $u) => $u->toApiArray())->values(),
        ]);
    }

    /**
     * Single university profile with all offered courses.
     */
    public function show(int $id)
    {
        $university = University::with('courses.category')->withCount('courses')->find($id);

        if (!$university) {
            return response()->json(['message' => 'University not found'], 404);
        }

        return response()->json(['data' => $university->toApiArray()]);
    }

    private function normalizeText(string $value): string
    {
        return str_replace(['ñ', 'Ñ'], 'n', mb_strtolower($value));
    }
}
