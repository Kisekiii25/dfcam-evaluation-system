<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationResult extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'teacher_id',
        'question_id',
        'answer',
        'selected_course',
        'selected_year',
        'selected_section',
        'academic_year',
        'semester',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id'     => 'integer',
            'teacher_id'  => 'integer',
            'question_id' => 'integer',
        ];
    }

    /**
     * Get the student who submitted this evaluation result.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the teacher who was evaluated.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    /**
     * Get the question associated with this result.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
