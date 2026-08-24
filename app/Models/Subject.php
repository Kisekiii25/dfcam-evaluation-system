<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'code',
        'description',
    ];

    /**
     * Get all teaching loads that use this subject.
     */
    public function teachingLoads(): HasMany
    {
        return $this->hasMany(TeachingLoad::class);
    }
}
