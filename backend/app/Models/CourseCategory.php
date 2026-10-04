<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseCategory extends Model
{
    use HasFactory;

    protected $table = 'course_categories';
    protected $primaryKey = 'category_id';
    public $timestamps = false;

    protected $fillable = [
        'category_name',
        'description',
    ];

    public function courses()
    {
        return $this->hasMany(Course::class, 'category_id', 'category_id');
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->category_id,
            'name' => $this->category_name,
            'description' => $this->description,
        ];
    }
}
