<?php

namespace App\Models;

use App\Enums\PaperSourceFileRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperSourceFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_id',
        'document_import_id',
        'created_by',
        'file_role',
        'disk',
        'path',
        'original_name',
        'mime_type',
        'size_bytes',
        'checksum',
        'metadata',
    ];

    protected $casts = [
        'file_role' => PaperSourceFileRole::class,
        'size_bytes' => 'integer',
        'metadata' => 'array',
    ];

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function documentImport(): BelongsTo
    {
        return $this->belongsTo(DocumentImport::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
