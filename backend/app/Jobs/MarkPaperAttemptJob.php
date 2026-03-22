<?php

namespace App\Jobs;

use App\Models\PaperAttempt;
use App\Services\Marking\MarkingOrchestrator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class MarkPaperAttemptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $attemptId)
    {
        $this->onQueue(config('ai_marking.queue', 'ai-marking'));
    }

    public function handle(MarkingOrchestrator $orchestrator): void
    {
        $attempt = PaperAttempt::query()->findOrFail($this->attemptId);

        $orchestrator->markAttempt($attempt);
    }
}
