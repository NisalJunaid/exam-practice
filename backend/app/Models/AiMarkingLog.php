<?php

namespace App\Models;

use App\Enums\AiMarkingLogStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMarkingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'paper_attempt_id',
        'attempt_answer_id',
        'provider',
        'model_name',
        'request_payload',
        'response_payload',
        'status',
        'error_message',
    ];

    protected $casts = [
        'status' => AiMarkingLogStatus::class,
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PaperAttempt::class, 'paper_attempt_id');
    }

    public function answer(): BelongsTo
    {
        return $this->belongsTo(AttemptAnswer::class, 'attempt_answer_id');
    }
}
