<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'course_id',
        'year_level',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'course_id' => 'integer',
            'year_level' => 'integer',
        ];
    }

    /**
     * Get the parent course that owns this section.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get all students assigned to this section.
     */
    public function students(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }

    /**
     * Get all teaching loads assigned to this section.
     */
    public function teachingLoads(): HasMany
    {
        return $this->hasMany(TeachingLoad::class);
    }
}
