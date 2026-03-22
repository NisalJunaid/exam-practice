<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Enums\ImportMatchStatus;
use App\Models\DocumentImport;
use App\Models\Paper;
use App\Models\QuestionRubric;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class ImportApprovalService
{
    public function approve(DocumentImport $import): Paper
    {
        if ($import->status !== DocumentImportStatus::NeedsReview) {
            throw new RuntimeException('Only reviewed draft imports can be approved.');
        }

        return DB::transaction(function () use ($import) {
            $metadata = $import->metadata ?? [];
            $subject = Subject::query()->firstOrCreate(
                [
                    'exam_board_id' => 1,
                    'exam_level_id' => 1,
                    'slug' => Str::slug(($metadata['subjectName'] ?? 'Imported Subject').'-'.($metadata['subjectCode'] ?? 'paper')),
                ],
                [
                    'name' => $metadata['subjectName'] ?? 'Imported Subject',
                    'code' => $metadata['subjectCode'] ?? null,
                ],
            );

            $paper = Paper::create([
                'subject_id' => $subject->id,
                'title' => $metadata['title'] ?? 'Imported Paper',
                'slug' => Str::slug(($metadata['title'] ?? 'imported-paper').'-'.$import->id),
                'paper_code' => $metadata['paperCode'] ?? null,
                'year' => $metadata['year'] ?? null,
                'session' => $metadata['session'] ?? null,
                'duration_minutes' => $metadata['durationMinutes'] ?? null,
                'total_marks' => (int) $import->items()->where('is_approved', true)->sum('resolved_max_marks'),
                'instructions' => 'Imported draft reviewed by admin before publication.',
                'is_published' => true,
                'source_question_paper_path' => $import->question_paper_path,
                'source_mark_scheme_path' => $import->mark_scheme_path,
            ]);

            foreach ($import->items()->where('is_approved', true)->get() as $index => $item) {
                $question = $paper->questions()->create([
                    'question_number' => $item->question_number,
                    'question_key' => $item->question_key,
                    'question_text' => $item->question_text,
                    'reference_answer' => $item->reference_answer,
                    'max_marks' => $item->resolved_max_marks,
                    'marking_guidelines' => $item->marking_guidelines,
                    'order_index' => $index + 1,
                ]);

                QuestionRubric::create([
                    'paper_question_id' => $question->id,
                    'marker_notes' => $item->marking_guidelines,
                    'keywords_expected' => array_values(array_filter(explode(', ', strtolower((string) $item->reference_answer)))) ?: null,
                ]);
            }

            $import->update([
                'status' => DocumentImportStatus::Approved,
                'approved_paper_id' => $paper->id,
                'processed_at' => now(),
                'summary' => array_merge($import->summary ?? [], [
                    'approvedItems' => $import->items()->where('is_approved', true)->count(),
                    'unresolvedItems' => $import->items()->whereIn('match_status', [ImportMatchStatus::Ambiguous, ImportMatchStatus::PaperOnly, ImportMatchStatus::SchemeOnly])->count(),
                ]),
            ]);

            return $paper->load(['subject.examBoard', 'subject.examLevel', 'questions.rubric']);
        });
    }
}
