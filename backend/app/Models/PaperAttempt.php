<?php

namespace App\Models;

use App\Enums\PaperAttemptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class PaperAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'paper_id',
        'status',
        'started_at',
        'submitted_at',
        'completed_at',
        'total_awarded_marks',
        'total_max_marks',
        'marking_summary',
    ];

    protected $casts = [
        'status' => PaperAttemptStatus::class,
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_awarded_marks' => 'integer',
        'total_max_marks' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function markings(): HasMany
    {
        return $this->hasMany(AttemptMarking::class);
    }

    public function aiLogs(): HasMany
    {
        return $this->hasMany(AiMarkingLog::class);
    }

    public function deadlineAt(): ?Carbon
    {
        if (! $this->started_at || ! $this->paper?->duration_minutes) {
            return null;
        }

        return $this->started_at->copy()->addMinutes((int) $this->paper->duration_minutes);
    }

    public function remainingSeconds(?Carbon $reference = null): ?int
    {
        $deadline = $this->deadlineAt();

        if (! $deadline) {
            return null;
        }

        return max(0, ($reference ?? now())->diffInSeconds($deadline, false));
    }

    public function hasTimedOut(?Carbon $reference = null): bool
    {
        $remainingSeconds = $this->remainingSeconds($reference);

        return $remainingSeconds !== null && $remainingSeconds <= 0;
    }

    public function isSubmittable(): bool
    {
        return $this->status === PaperAttemptStatus::InProgress;
    }

    public function isCompleted(): bool
    {
        return $this->status === PaperAttemptStatus::Completed;
    }

    public function calculateAwardedMarks(): int
    {
        return (int) $this->markings()->sum('awarded_marks');
    }
}
