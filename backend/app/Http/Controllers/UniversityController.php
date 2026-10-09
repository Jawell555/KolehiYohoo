<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\University;
use App\Services\GeocodingService;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    /**
     * Haversine great-circle distance in km between the student (bindings: lat, lng, lat)
     * and each school. LEAST/GREATEST keep acos() inside [-1, 1] to avoid rounding errors; the CASE is needed because
     * Postgres GREATEST/LEAST ignore NULLs, which would give schools without coordinates a bogus distance.
     */
    private const DISTANCE_SQL = 'CASE WHEN universities.latitude IS NULL OR universities.longitude IS NULL THEN NULL ELSE '
        . '6371 * acos(LEAST(1, GREATEST(-1, '
        . 'cos(radians(?)) * cos(radians(universities.latitude)) '
        . '* cos(radians(universities.longitude) - radians(?)) '
        . '+ sin(radians(?)) * sin(radians(universities.latitude))))) END';

    /**
     * List universities, optionally filtered.
     *
     * Query params:
     *  - course_id: exact course (selected from the dropdown)
     *  - course:    free-text course search (name or code, e.g. "BSIT", "BS Computer Science")
     *  - lat, lng:  the student's coordinates (browser "use my location"). Results are sorted nearest-first.
     *  - location:  the student's starting point as text. It is geocoded and results are sorted nearest-first;
     *               if it can't be geocoded, falls back to a text match on address / name ("Binan" == "Biñan").
     *  - type:      "public" or "private" (matches the start of institution_type; anything else = both)
     */
    public function index(Request $request, GeocodingService $geocoder)
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

        // ---- Work out where the student is starting from -------------------------------
        $origin = $this->resolveOrigin($request, $location, $geocoder);

        if ($origin) {
            // Nearest first. Schools without coordinates are listed last.
            $query->selectRaw(self::DISTANCE_SQL . ' AS distance_km', [$origin['lat'], $origin['lng'], $origin['lat']])
                ->reorder()
                ->orderByRaw('distance_km ASC NULLS LAST')
                ->orderBy('name');
        } elseif ($location !== '') {
            // Couldn't geocode the text: keep the old behaviour (match against address / name).
            $loc = '%' . Course::escapeLike($this->normalizeText($location)) . '%';
            $query->where(function ($w) use ($loc) {
                $w->whereRaw("translate(lower(coalesce(address, '')), 'ñÑ', 'nn') LIKE ?", [$loc])
                    ->orWhereRaw("translate(lower(name), 'ñÑ', 'nn') LIKE ?", [$loc]);
            });
        }

        return response()->json([
            'data' => $query->get()->map(fn (University $u) => $u->toApiArray())->values(),
            'meta' => [
                'sorted_by_distance' => $origin !== null,
                'origin' => $origin,
            ],
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

    /**
     * Starting point of the student: GPS coordinates if sent, otherwise the geocoded text.
     *
     * @return array{lat: float, lng: float, label: string}|null
     */
    private function resolveOrigin(Request $request, string $location, GeocodingService $geocoder): ?array
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');

        if (is_numeric($lat) && is_numeric($lng)
            && abs((float) $lat) <= 90 && abs((float) $lng) <= 180) {
            return ['lat' => (float) $lat, 'lng' => (float) $lng, 'label' => 'your current location'];
        }

        if ($location !== '') {
            return $geocoder->geocode($location);
        }

        return null;
    }
}
