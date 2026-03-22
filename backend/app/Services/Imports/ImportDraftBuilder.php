<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Enums\ImportMatchStatus;
use App\Models\DocumentImport;
use Illuminate\Support\Facades\DB;

class ImportDraftBuilder
{
    public function build(DocumentImport $import, array $metadata, array $matchedItems, array $rawPayload = []): DocumentImport
    {
        return DB::transaction(function () use ($import, $metadata, $matchedItems, $rawPayload) {
            $import->items()->delete();

            foreach ($matchedItems as $item) {
                $import->items()->create($item);
            }

            $summary = [
                'matchedItems' => count(array_filter($matchedItems, fn (array $item): bool => ($item['match_status'] ?? null) === ImportMatchStatus::Matched)),
                'paperOnlyItems' => count(array_filter($matchedItems, fn (array $item): bool => ($item['match_status'] ?? null) === ImportMatchStatus::PaperOnly)),
                'schemeOnlyItems' => count(array_filter($matchedItems, fn (array $item): bool => ($item['match_status'] ?? null) === ImportMatchStatus::SchemeOnly)),
                'ambiguousItems' => count(array_filter($matchedItems, fn (array $item): bool => ($item['match_status'] ?? null) === ImportMatchStatus::Ambiguous)),
                'resolvedItems' => count(array_filter($matchedItems, fn (array $item): bool => ($item['match_status'] ?? null) === ImportMatchStatus::Resolved)),
                'totalItems' => count($matchedItems),
            ];

            $import->update([
                'status' => DocumentImportStatus::NeedsReview,
                'metadata' => $metadata,
                'summary' => $summary,
                'raw_extraction_payload' => $rawPayload,
                'error_message' => null,
                'processed_at' => now(),
            ]);

            return $import->fresh(['items']);
        });
    }
}
