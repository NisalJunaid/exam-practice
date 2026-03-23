<?php

namespace App\Models;

use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
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
        'question_type',
        'question_text',
        'reference_answer',
        'max_marks',
        'marking_guidelines',
        'sample_full_mark_answer',
        'order_index',
        'stem_context',
        'requires_visual_reference',
        'visual_reference_type',
        'visual_reference_note',
        'has_visual',
    ];

    protected $casts = [
        'question_type' => QuestionType::class,
        'max_marks' => 'integer',
        'order_index' => 'integer',
        'requires_visual_reference' => 'boolean',
        'visual_reference_type' => VisualReferenceType::class,
        'has_visual' => 'boolean',
    ];

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function rubric(): HasOne
    {
        return $this->hasOne(QuestionRubric::class);
    }

    public function visualAssets(): HasMany
    {
        return $this->hasMany(QuestionVisualAsset::class)->orderBy('sort_order')->orderBy('id');
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
