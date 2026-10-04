<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';
    protected $primaryKey = 'student_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'address',
        'school_name',
        'contact_no',
        'created_at',
    ];

    public function getFNameAttribute()
    {
        return $this->first_name;
    }

    public function setFNameAttribute($value)
    {
        $this->attributes['first_name'] = $value;
    }

    public function getLNameAttribute()
    {
        return $this->last_name;
    }

    public function setLNameAttribute($value)
    {
        $this->attributes['last_name'] = $value;
    }

    public function getPhoneAttribute()
    {
        return $this->contact_no;
    }

    public function setPhoneAttribute($value)
    {
        $this->attributes['contact_no'] = $value;
    }


    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
