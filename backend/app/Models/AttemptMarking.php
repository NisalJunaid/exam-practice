<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttemptMarking extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_attempt_id',
        'attempt_answer_id',
        'paper_question_id',
        'awarded_marks',
        'max_marks',
        'reasoning',
        'feedback',
        'strengths',
        'mistakes',
        'ai_confidence',
    ];

    protected $casts = [
        'awarded_marks' => 'integer',
        'max_marks' => 'integer',
        'strengths' => 'array',
        'mistakes' => 'array',
        'ai_confidence' => 'decimal:2',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PaperAttempt::class, 'paper_attempt_id');
    }

    public function answer(): BelongsTo
    {
        return $this->belongsTo(AttemptAnswer::class, 'attempt_answer_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(PaperQuestion::class, 'paper_question_id');
    }
}
