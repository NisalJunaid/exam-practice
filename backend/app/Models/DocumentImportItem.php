<?php

namespace App\Models;

use App\Enums\ImportMatchStatus;
use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentImportItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_import_id',
        'question_key',
        'parent_key',
        'question_type',
        'question_number',
        'stem_context',
        'question_text',
        'reference_answer',
        'marking_guidelines',
        'sample_full_mark_answer',
        'question_paper_marks',
        'mark_scheme_marks',
        'resolved_max_marks',
        'match_status',
        'requires_visual_reference',
        'visual_reference_type',
        'visual_reference_note',
        'has_visual',
        'flags',
        'page_number',
        'question_page_number',
        'mark_scheme_page_number',
        'order_index',
        'is_approved',
        'admin_notes',
        'raw_payload',
        'raw_question_payload',
        'raw_mark_scheme_payload',
    ];

    protected $casts = [
        'question_type' => QuestionType::class,
        'match_status' => ImportMatchStatus::class,
        'visual_reference_type' => VisualReferenceType::class,
        'question_paper_marks' => 'integer',
        'mark_scheme_marks' => 'integer',
        'resolved_max_marks' => 'integer',
        'requires_visual_reference' => 'boolean',
        'has_visual' => 'boolean',
        'flags' => 'array',
        'page_number' => 'integer',
        'question_page_number' => 'integer',
        'mark_scheme_page_number' => 'integer',
        'order_index' => 'integer',
        'is_approved' => 'boolean',
        'raw_payload' => 'array',
        'raw_question_payload' => 'array',
        'raw_mark_scheme_payload' => 'array',
    ];

    public function documentImport(): BelongsTo
    {
        return $this->belongsTo(DocumentImport::class);
    }

    public function visualAssets(): HasMany
    {
        return $this->hasMany(QuestionVisualAsset::class)->orderBy('sort_order')->orderBy('id');
    }
}
