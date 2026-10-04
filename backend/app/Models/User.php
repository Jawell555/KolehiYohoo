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
        'email_verified_at',
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
            'email_verified_at' => 'datetime',
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

    public function getRoleNameAttribute(): string
    {
        return $this->role?->role_name ?? match ($this->role_id) {
            1 => 'student',
            2 => 'institution',
            3 => 'admin',
            default => 'student',
        };
    }

    public function getDisplayNameAttribute(): string
    {
        $role = $this->role_name;
        if ($role === 'student' && $this->student) {
            $name = trim(($this->student->first_name ?? '') . ' ' . ($this->student->last_name ?? ''));
            return $name ?: $this->email;
        }

        if ($role === 'institution' && $this->institution) {
            return $this->institution->institution_name ?: $this->email;
        }

        if ($role === 'admin' && $this->admin) {
            return $this->admin->name ?: $this->email;
        }

        return $this->email;
    }
}
