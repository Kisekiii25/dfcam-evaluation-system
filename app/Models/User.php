<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'section_id',
        'must_change_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'password'             => 'hashed',
            'must_change_password' => 'boolean',
            'section_id'           => 'integer',
        ];
    }

    /**
     * Get the section that the user belongs to.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get all evaluation results submitted by this user.
     */
    public function evaluationResults(): HasMany
    {
        return $this->hasMany(EvaluationResult::class);
    }

    /**
     * Scope query to fetch teachers assigned to this student's section.
     */
    public function assignedTeachers(?EvaluationSetting $setting = null): Builder
    {
        if (!$this->section_id) {
            return Teacher::query()->whereRaw('1 = 0');
        }

        return Teacher::query()->whereHas('teachingLoads', function ($query) use ($setting) {
            $query->where('section_id', $this->section_id);

            if ($setting?->academic_year && $setting?->semester) {
                $query->where('academic_year', $setting->academic_year)
                    ->where('semester', $setting->semester);
            }
        });
    }
}
