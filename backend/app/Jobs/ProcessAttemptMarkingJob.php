<?php

namespace App\Jobs;

use App\Models\PaperAttempt;
use App\Services\Marking\AttemptMarkingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessAttemptMarkingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public PaperAttempt $attempt)
    {
    }

    public function handle(AttemptMarkingService $service): void
    {
        $service->markAttempt($this->attempt);
    }
}
