<?php

namespace App\Models;

use App\Enums\ImportMatchStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentImportItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_import_id',
        'question_key',
        'parent_key',
        'question_number',
        'stem_context',
        'question_text',
        'reference_answer',
        'marking_guidelines',
        'question_paper_marks',
        'mark_scheme_marks',
        'resolved_max_marks',
        'match_status',
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
        'match_status' => ImportMatchStatus::class,
        'question_paper_marks' => 'integer',
        'mark_scheme_marks' => 'integer',
        'resolved_max_marks' => 'integer',
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
}
