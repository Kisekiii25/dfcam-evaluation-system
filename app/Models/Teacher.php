<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'employee_id',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get all teaching loads assigned to this teacher.
     */
    public function teachingLoads(): HasMany
    {
        return $this->hasMany(TeachingLoad::class);
    }

    /**
     * Get all evaluation results for this teacher.
     */
    public function evaluationResults(): HasMany
    {
        return $this->hasMany(EvaluationResult::class);
    }
}
