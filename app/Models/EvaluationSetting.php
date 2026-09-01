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

        // 2. Start Date Check: Must be starting at start of day (00:00:00)
        if ($this->start_date && $now->lt($this->start_date->copy()->startOfDay())) {
            return false;
        }

        // 3. End Date Check: Remains valid through the end of the end_date (23:59:59)
        if ($this->end_date && $now->gt($this->end_date->copy()->endOfDay())) {
            return false;
        }

        return true;
    }
}
