<?php

namespace App\Models;

use App\Enums\QuestionVisualAssetRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class QuestionVisualAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_question_id',
        'document_import_item_id',
        'asset_role',
        'disk',
        'file_path',
        'original_name',
        'mime_type',
        'sort_order',
    ];

    protected $casts = [
        'asset_role' => QuestionVisualAssetRole::class,
        'sort_order' => 'integer',
    ];

    protected $appends = ['url'];

    public function importItem(): BelongsTo
    {
        return $this->belongsTo(DocumentImportItem::class, 'document_import_item_id');
    }

    public function paperQuestion(): BelongsTo
    {
        return $this->belongsTo(PaperQuestion::class);
    }

    public function getUrlAttribute(): ?string
    {
        if (blank($this->file_path)) {
            return null;
        }

        return Storage::disk($this->disk)->url($this->file_path);
    }
}
