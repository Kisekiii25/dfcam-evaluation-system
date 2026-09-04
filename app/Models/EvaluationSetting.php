<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class EvaluationSetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'academic_year',
        'semester',
        'start_date',
        'end_date',
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
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Helper to check if evaluation period is currently open and active.
     */
    public function isOpen(): bool
    {
        // 1. Must be manually toggled active
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        // 2. Start Date Check: Must be past or equal to exact start date/time
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        // 3. End Date Check: Must be before or equal to exact end date/time
        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        return true;
    }
}
