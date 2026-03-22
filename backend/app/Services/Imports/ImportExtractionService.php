<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Enums\ImportMatchStatus;
use App\Models\DocumentImport;
use Illuminate\Support\Str;

class ImportExtractionService
{
    public function buildDraft(DocumentImport $import): DocumentImport
    {
        $metadata = [
            'title' => Str::headline(pathinfo($import->question_paper_name, PATHINFO_FILENAME)),
            'paperCode' => Str::upper(Str::substr(md5($import->question_paper_name), 0, 6)),
            'year' => now()->year,
            'session' => 'Mock',
            'durationMinutes' => 75,
            'subjectName' => 'Biology',
            'subjectCode' => '0610',
            'examBoard' => 'Cambridge',
            'examLevel' => 'IGCSE',
        ];

        $items = [
            [
                'question_key' => '1(a)',
                'question_number' => '1',
                'question_text' => 'State two observable features of a healthy leaf shown in the paper extract.',
                'reference_answer' => 'Green colour, broad surface area, intact veins.',
                'marking_guidelines' => 'Award one mark per correct valid feature, any two.',
                'question_paper_marks' => 2,
                'mark_scheme_marks' => 2,
                'resolved_max_marks' => 2,
                'match_status' => ImportMatchStatus::Matched,
                'page_number' => 1,
                'order_index' => 1,
                'is_approved' => true,
            ],
            [
                'question_key' => '1(b)',
                'question_number' => '1',
                'question_text' => 'Explain why chlorophyll is important for photosynthesis.',
                'reference_answer' => 'Chlorophyll absorbs light energy used to drive photosynthesis.',
                'marking_guidelines' => 'Mention light absorption and photosynthesis energy transfer.',
                'question_paper_marks' => 3,
                'mark_scheme_marks' => 3,
                'resolved_max_marks' => 3,
                'match_status' => ImportMatchStatus::Matched,
                'page_number' => 1,
                'order_index' => 2,
                'is_approved' => true,
            ],
            [
                'question_key' => '2(a)',
                'question_number' => '2',
                'question_text' => 'Describe one limitation in the student experiment method.',
                'reference_answer' => 'Sample size too small, uncontrolled variables, or timing inconsistency.',
                'marking_guidelines' => 'Accept any valid methodological limitation from the experiment context.',
                'question_paper_marks' => 2,
                'mark_scheme_marks' => 2,
                'resolved_max_marks' => 2,
                'match_status' => ImportMatchStatus::Ambiguous,
                'page_number' => 2,
                'order_index' => 3,
                'is_approved' => false,
            ],
        ];

        $import->items()->delete();
        $import->items()->createMany($items);

        $summary = [
            'matchedItems' => 2,
            'paperOnlyItems' => 0,
            'schemeOnlyItems' => 0,
            'ambiguousItems' => 1,
            'totalItems' => count($items),
        ];

        $import->update([
            'status' => DocumentImportStatus::NeedsReview,
            'metadata' => $metadata,
            'summary' => $summary,
            'raw_extraction_payload' => [
                'strategy' => 'default_fake_import_extractor',
                'note' => 'This development extractor creates a deterministic draft that must still be reviewed and approved by an admin.',
            ],
            'processed_at' => now(),
        ]);

        return $import->fresh(['items']);
    }
}
