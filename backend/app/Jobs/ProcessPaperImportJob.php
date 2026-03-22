<?php

namespace App\Jobs;

use App\Models\DocumentImport;
use App\Services\Imports\ImportExtractionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPaperImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public DocumentImport $documentImport)
    {
    }

    public function handle(ImportExtractionService $service): void
    {
        $service->buildDraft($this->documentImport);
    }
}
