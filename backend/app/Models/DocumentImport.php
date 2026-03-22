<?php

namespace App\Models;

use App\Enums\DocumentImportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentImport extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'status',
        'question_paper_path',
        'question_paper_name',
        'mark_scheme_path',
        'mark_scheme_name',
        'metadata',
        'summary',
        'raw_extraction_payload',
        'review_notes',
        'approved_paper_id',
        'processed_at',
    ];

    protected $casts = [
        'status' => DocumentImportStatus::class,
        'metadata' => 'array',
        'summary' => 'array',
        'raw_extraction_payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(DocumentImportItem::class)->orderBy('order_index');
    }

    public function approvedPaper(): BelongsTo
    {
        return $this->belongsTo(Paper::class, 'approved_paper_id');
    }

    public function sourceFiles(): HasMany
    {
        return $this->hasMany(PaperSourceFile::class)->orderBy('id');
    }
}
