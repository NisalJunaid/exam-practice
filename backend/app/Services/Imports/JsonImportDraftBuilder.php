<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Enums\ImportMatchStatus;
use App\Models\DocumentImport;
use Illuminate\Support\Facades\DB;

class JsonImportDraftBuilder
{
    public function build(DocumentImport $import, array $validatedPayload, array $preview): DocumentImport
    {
        return DB::transaction(function () use ($import, $validatedPayload, $preview) {
            $import->items()->delete();

            foreach ($validatedPayload['questions'] as $index => $question) {
                $requiresVisual = (bool) $question['requires_visual_reference'];
                $flags = $question['flags'];

                $import->items()->create([
                    'question_key' => $question['question_key'],
                    'parent_key' => $question['parent_key'],
                    'question_number' => $this->deriveQuestionNumber($question['question_key']),
                    'question_type' => $question['question_type'],
                    'stem_context' => $question['stem_context'],
                    'question_text' => $question['question_text'],
                    'reference_answer' => $question['reference_answer'],
                    'marking_guidelines' => $question['marking_guidelines'],
                    'sample_full_mark_answer' => $question['sample_full_mark_answer'],
                    'question_paper_marks' => $question['max_marks'],
                    'mark_scheme_marks' => $question['max_marks'],
                    'resolved_max_marks' => $question['max_marks'],
                    'match_status' => $this->determineStatus($requiresVisual, $flags),
                    'requires_visual_reference' => $requiresVisual,
                    'visual_reference_type' => $question['visual_reference_type'],
                    'visual_reference_note' => $question['visual_reference_note'],
                    'has_visual' => (bool) ($question['flags']['has_visual'] ?? false),
                    'flags' => $flags,
                    'question_page_number' => $question['source']['question_page'],
                    'mark_scheme_page_number' => $question['source']['mark_scheme_page'],
                    'order_index' => $index + 1,
                    'is_approved' => ! ($flags['needs_review'] ?? false),
                    'raw_payload' => $question,
                    'raw_question_payload' => $question,
                    'raw_mark_scheme_payload' => [
                        'reference_answer' => $question['reference_answer'],
                        'marking_guidelines' => $question['marking_guidelines'],
                        'sample_full_mark_answer' => $question['sample_full_mark_answer'],
                    ],
                ]);
            }

            $import->update([
                'status' => DocumentImportStatus::NeedsReview,
                'metadata' => $validatedPayload['paper'],
                'summary' => $preview['counts'],
                'preview_payload' => $preview,
                'raw_json_payload' => $validatedPayload,
                'raw_extraction_payload' => ['source' => 'canonical_json'],
                'error_message' => null,
                'processed_at' => now(),
            ]);

            return $import->fresh(['items.visualAssets']);
        });
    }

    private function determineStatus(bool $requiresVisual, array $flags): ImportMatchStatus
    {
        if ($requiresVisual) {
            return ImportMatchStatus::MissingVisual;
        }

        if (($flags['needs_review'] ?? false) || ($flags['low_confidence_match'] ?? false)) {
            return ImportMatchStatus::Warning;
        }

        return ImportMatchStatus::Ready;
    }

    private function deriveQuestionNumber(string $questionKey): string
    {
        return (string) preg_replace('/[^0-9].*$/', '', $questionKey) ?: $questionKey;
    }
}
