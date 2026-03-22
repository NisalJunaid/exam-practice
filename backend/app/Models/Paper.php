<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Paper extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'title',
        'slug',
        'paper_code',
        'year',
        'session',
        'duration_minutes',
        'total_marks',
        'instructions',
        'is_published',
        'source_question_paper_path',
        'source_mark_scheme_path',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'year' => 'integer',
        'duration_minutes' => 'integer',
        'total_marks' => 'integer',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(PaperQuestion::class)->orderBy('order_index');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(PaperAttempt::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function calculateTotalMarks(): int
    {
        return (int) $this->questions()->sum('max_marks');
    }
}
