<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    use HasFactory;

    protected $table = 'universities';
    protected $primaryKey = 'university_id';
    public $timestamps = false;

    protected $fillable = [
        'institution_id',
        'name',
        'abbreviation',
        'institution_type',
        'address',
        'website',
        'graduate_programs',
    ];

    /**
     * Courses offered by this university (via the course_offerings pivot table).
     */
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_offerings', 'university_id', 'course_id');
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class, 'institution_id', 'institution_id');
    }

    /**
     * Shape returned to the frontend.
     */
    public function toApiArray(): array
    {
        $courses = $this->relationLoaded('courses')
            ? $this->courses->sortBy('course_name', SORT_NATURAL | SORT_FLAG_CASE)->values()
            : collect();

        return [
            'id' => $this->university_id,
            'name' => $this->name,
            'abbreviation' => $this->abbreviation ?: $this->name,
            'institution_type' => $this->institution_type,
            'address' => $this->address,
            'website' => $this->website,
            'graduate_programs' => $this->graduate_programs,
            'courses_count' => $this->courses_count ?? ($this->relationLoaded('courses') ? $courses->count() : 0),
            'courses' => $courses->map(fn (Course $c) => $c->toApiArray())->all(),
        ];
    }
}
