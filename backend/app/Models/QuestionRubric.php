<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionRubric extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_question_id',
        'band_descriptor',
        'keywords_expected',
        'common_mistakes',
        'acceptable_alternatives',
        'marker_notes',
    ];

    protected $casts = [
        'keywords_expected' => 'array',
        'common_mistakes' => 'array',
        'acceptable_alternatives' => 'array',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(PaperQuestion::class, 'paper_question_id');
    }
}
