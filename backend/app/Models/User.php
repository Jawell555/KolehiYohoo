<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'email',
        'hash_password',
        'role_id',
        'is_active',
    ];

    protected $hidden = [
        'hash_password',
        'remember_token',
    ];

    /**
     * Use hash_password column for authentication.
     */
    public function getAuthPasswordName(): string
    {
        return 'hash_password';
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id');
    }

    public function institution()
    {
        return $this->hasOne(Institution::class, 'user_id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'user_id');
    }
}
