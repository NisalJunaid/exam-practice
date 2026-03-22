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
        'question_number',
        'question_text',
        'reference_answer',
        'marking_guidelines',
        'question_paper_marks',
        'mark_scheme_marks',
        'resolved_max_marks',
        'match_status',
        'page_number',
        'order_index',
        'is_approved',
        'admin_notes',
        'raw_payload',
    ];

    protected $casts = [
        'match_status' => ImportMatchStatus::class,
        'question_paper_marks' => 'integer',
        'mark_scheme_marks' => 'integer',
        'resolved_max_marks' => 'integer',
        'page_number' => 'integer',
        'order_index' => 'integer',
        'is_approved' => 'boolean',
        'raw_payload' => 'array',
    ];

    public function documentImport(): BelongsTo
    {
        return $this->belongsTo(DocumentImport::class);
    }
}
