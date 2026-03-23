<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AttemptAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_attempt_id',
        'paper_question_id',
        'student_answer',
        'structured_answer',
        'is_blank',
        'submitted_at',
    ];

    protected $casts = [
        'structured_answer' => 'array',
        'is_blank' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PaperAttempt::class, 'paper_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(PaperQuestion::class, 'paper_question_id');
    }

    public function marking(): HasOne
    {
        return $this->hasOne(AttemptMarking::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(AttemptAnswerAsset::class)->orderByDesc('id');
    }
}
