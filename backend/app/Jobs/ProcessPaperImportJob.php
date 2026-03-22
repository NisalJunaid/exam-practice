<?php

namespace App\Jobs;

use App\Enums\DocumentImportStatus;
use App\Models\DocumentImport;
use App\Services\Imports\ImportDraftBuilder;
use App\Services\Imports\MarkSchemeParser;
use App\Services\Imports\PaperMetadataExtractor;
use App\Services\Imports\PdfTextExtractionService;
use App\Services\Imports\QuestionMarkSchemeMatcher;
use App\Services\Imports\QuestionPaperParser;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ProcessPaperImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public DocumentImport $documentImport)
    {
        $this->onQueue((string) config('paper_imports.queue', 'imports'));
    }

    public function handle(
        PdfTextExtractionService $pdfTextExtractionService,
        PaperMetadataExtractor $paperMetadataExtractor,
        QuestionPaperParser $questionPaperParser,
        MarkSchemeParser $markSchemeParser,
        QuestionMarkSchemeMatcher $matcher,
        ImportDraftBuilder $draftBuilder,
    ): void {
        $import = $this->documentImport->fresh(['sourceFiles']);
        $questionPages = $pdfTextExtractionService->extract($import->question_paper_path);
        $markSchemePages = $pdfTextExtractionService->extract($import->mark_scheme_path);

        $metadata = $paperMetadataExtractor->mergeMetadata(
            $paperMetadataExtractor->extractFromQuestionPaper($questionPages),
            $paperMetadataExtractor->extractFromMarkScheme($markSchemePages),
        );

        $questionNodes = $questionPaperParser->parse($questionPages);
        $markEntries = $markSchemeParser->parse($markSchemePages);
        $matchedItems = $matcher->match($questionNodes, $markEntries);

        $draftBuilder->build($import, $metadata, $matchedItems, [
            'question_paper_pages' => $questionPages,
            'mark_scheme_pages' => $markSchemePages,
            'question_nodes' => $questionNodes,
            'mark_scheme_entries' => $markEntries,
            'matched_items' => array_map(function (array $item): array {
                $item['match_status'] = $item['match_status']?->value ?? $item['match_status'];

                return $item;
            }, $matchedItems),
        ]);
    }

    public function failed(Throwable $exception): void
    {
        $this->documentImport->forceFill([
            'status' => DocumentImportStatus::Failed,
            'error_message' => $exception->getMessage(),
            'processed_at' => now(),
        ])->save();
    }
}
