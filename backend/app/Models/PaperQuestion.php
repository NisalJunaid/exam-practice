<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PaperQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'question_number',
        'question_key',
        'question_text',
        'reference_answer',
        'max_marks',
        'marking_guidelines',
        'sample_full_mark_answer',
        'order_index',
        'stem_context',
    ];

    protected $casts = [
        'max_marks' => 'integer',
        'order_index' => 'integer',
    ];

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function rubric(): HasOne
    {
        return $this->hasOne(QuestionRubric::class);
    }

    public function attemptAnswers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function attemptMarkings(): HasMany
    {
        return $this->hasMany(AttemptMarking::class);
    }
}
