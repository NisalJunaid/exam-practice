<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class AttemptAnswerAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_answer_id',
        'asset_type',
        'disk',
        'file_path',
        'original_name',
        'mime_type',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected $appends = ['url'];

    public function attemptAnswer(): BelongsTo
    {
        return $this->belongsTo(AttemptAnswer::class);
    }

    public function getUrlAttribute(): ?string
    {
        if (blank($this->file_path)) {
            return null;
        }

        return Storage::disk($this->disk)->url($this->file_path);
    }
}
