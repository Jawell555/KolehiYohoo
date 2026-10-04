<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';
    protected $primaryKey = 'course_id';
    public $timestamps = false;

    protected $fillable = [
        'course_name',
        'completion_year',
        'category_id',
    ];

    protected function casts(): array
    {
        return [
            'completion_year' => 'integer',
        ];
    }

    /**
     * Universities offering this course (via the course_offerings pivot table).
     */
    public function universities()
    {
        return $this->belongsToMany(University::class, 'course_offerings', 'course_id', 'university_id');
    }

    /**
     * Category / college this course belongs to (course_categories).
     */
    public function category()
    {
        return $this->belongsTo(CourseCategory::class, 'category_id', 'category_id');
    }

    /**
     * Short code taken from the trailing parentheses of the course name,
     * e.g. "Bachelor of Science in Information Technology (BSIT)" -> "BSIT".
     */
    public function getCodeAttribute(): ?string
    {
        if (preg_match('/\(([^()]+)\)\s*$/u', (string) $this->course_name, $m)) {
            return trim($m[1]);
        }

        return null;
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->course_id,
            'name' => $this->course_name,
            'code' => $this->code,
            'completion_year' => $this->completion_year,
            'category' => $this->relationLoaded('category') && $this->category
                ? $this->category->toApiArray()
                : null,
        ];
    }

    /**
     * Build the list of ILIKE search patterns for a free-text course query.
     * Expands common shorthand ("BS ...", "AB ...", "BA ...") so that typing
     * "BS Computer Science" matches "Bachelor of Science in Computer Science (BSCS)".
     */
    public static function searchPatterns(string $query): array
    {
        $q = trim(preg_replace('/\s+/u', ' ', $query));
        if ($q === '') {
            return [];
        }

        $patterns = [$q];
        $lower = mb_strtolower($q);

        $prefixes = [
            'bs in ' => 'bachelor of science in ',
            'b.s. in ' => 'bachelor of science in ',
            'b.s. ' => 'bachelor of science in ',
            'bs ' => 'bachelor of science in ',
            'ab in ' => 'bachelor of arts in ',
            'ba in ' => 'bachelor of arts in ',
            'ab ' => 'bachelor of arts in ',
            'ba ' => 'bachelor of arts in ',
        ];

        foreach ($prefixes as $short => $long) {
            if (str_starts_with($lower, $short)) {
                $rest = substr($q, strlen($short));
                $patterns[] = $long . $rest;
                // Also match the bare subject, e.g. "Computer Science"
                $patterns[] = $rest;
                break;
            }
        }

        return array_values(array_unique(array_filter($patterns, fn ($p) => trim($p) !== '')));
    }

    /**
     * Escape LIKE wildcards in user input.
     */
    public static function escapeLike(string $value): string
    {
        return addcslashes($value, '\\%_');
    }
}
