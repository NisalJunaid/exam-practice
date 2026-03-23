<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Models\DocumentImport;
use App\Models\ExamBoard;
use App\Models\ExamLevel;
use App\Models\Paper;
use App\Models\PaperQuestion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class ImportApprovalService
{
    public function __construct(private readonly ImportVisualAssetService $visualAssetService) {}

    public function approve(DocumentImport $import, bool $overrideMissingVisuals = false): Paper
    {
        if ($import->status !== DocumentImportStatus::NeedsReview) {
            throw new RuntimeException('Only draft imports in needs_review can be approved.');
        }

        $items = $import->items()->with('visualAssets')->orderBy('order_index')->get();

        if ($items->isEmpty()) {
            throw new RuntimeException('Approve at least one import item before approval.');
        }

        $missingRequiredVisuals = $items
            ->filter(fn ($item) => $item->requires_visual_reference && $item->visualAssets->isEmpty())
            ->count();

        if ($missingRequiredVisuals > 0 && ! $overrideMissingVisuals) {
            throw new RuntimeException('Upload visuals for all image-dependent questions or approve with an explicit override.');
        }

        return DB::transaction(function () use ($import, $items, $missingRequiredVisuals, $overrideMissingVisuals) {
            $paper = $this->createPaperFromImport($import);
            $this->createQuestionsFromImportItems($paper, $items);
            $this->attachSourceFiles($paper, $import);

            $paper->update(['total_marks' => $paper->calculateTotalMarks()]);

            $import->update([
                'status' => DocumentImportStatus::Approved,
                'approved_paper_id' => $paper->id,
                'processed_at' => now(),
                'summary' => array_merge($import->summary ?? [], [
                    'approvedItems' => $items->count(),
                    'missingRequiredVisuals' => $missingRequiredVisuals,
                    'overrideMissingVisuals' => $overrideMissingVisuals,
                ]),
            ]);

            return $paper->load(['subject.examBoard', 'subject.examLevel', 'questions.rubric', 'questions.visualAssets']);
        });
    }

    public function createPaperFromImport(DocumentImport $import): Paper
    {
        $metadata = $import->metadata ?? [];
        $boardName = (string) ($metadata['board'] ?? 'Imported Board');
        $levelName = (string) ($metadata['level'] ?? 'Imported Level');

        $board = ExamBoard::query()->firstOrCreate(
            ['slug' => Str::slug($boardName)],
            ['name' => $boardName],
        );

        $level = ExamLevel::query()->firstOrCreate(
            ['slug' => Str::slug($levelName)],
            ['name' => $levelName],
        );

        $subject = $board->subjects()->firstOrCreate(
            [
                'exam_level_id' => $level->id,
                'slug' => Str::slug(($metadata['subject'] ?? 'Imported Subject').'-'.($metadata['paper_code'] ?? 'paper')),
            ],
            [
                'name' => $metadata['subject'] ?? 'Imported Subject',
                'code' => $metadata['paper_code'] ?? null,
            ],
        );

        return Paper::create([
            'subject_id' => $subject->id,
            'title' => $metadata['title'] ?? 'Imported Paper',
            'slug' => Str::slug(($metadata['title'] ?? 'imported-paper').'-'.$import->id),
            'paper_code' => $metadata['paper_code'] ?? null,
            'year' => $metadata['year'] ?? null,
            'session' => $metadata['session'] ?? null,
            'duration_minutes' => $metadata['duration_minutes'] ?? null,
            'total_marks' => 0,
            'instructions' => $metadata['instructions'] ?? 'Imported via JSON admin review pipeline. Publication remains manual.',
            'is_published' => false,
            'source_question_paper_path' => $import->json_file_path,
            'source_mark_scheme_path' => null,
        ]);
    }

    public function createQuestionsFromImportItems(Paper $paper, Collection $items): void
    {
        $items->values()->each(function ($item, int $index) use ($paper): void {
            $question = PaperQuestion::create([
                'paper_id' => $paper->id,
                'question_number' => $item->question_number ?? Str::before((string) $item->question_key, '('),
                'question_key' => $item->question_key,
                'question_type' => $item->question_type,
                'question_text' => $item->question_text,
                'reference_answer' => $item->reference_answer ?? $item->marking_guidelines ?? 'Imported answer guidance pending.',
                'max_marks' => $item->resolved_max_marks ?? $item->mark_scheme_marks ?? $item->question_paper_marks ?? 0,
                'marking_guidelines' => $item->marking_guidelines,
                'sample_full_mark_answer' => $item->sample_full_mark_answer,
                'order_index' => $index + 1,
                'stem_context' => $item->stem_context,
                'requires_visual_reference' => $item->requires_visual_reference,
                'visual_reference_type' => $item->visual_reference_type,
                'visual_reference_note' => $item->visual_reference_note,
                'has_visual' => $item->visualAssets->isNotEmpty(),
            ]);

            $question->rubric()->create([
                'band_descriptor' => null,
                'keywords_expected' => $this->extractKeywords($item->reference_answer),
                'marker_notes' => $item->marking_guidelines ?? $item->reference_answer,
            ]);

            $this->visualAssetService->cloneToPaperQuestion($item, $question);
        });
    }

    public function attachSourceFiles(Paper $paper, DocumentImport $import): void
    {
        $import->sourceFiles()->get()->each(function ($sourceFile) use ($paper): void {
            $sourceFile->update(['paper_id' => $paper->id]);
        });
    }

    private function extractKeywords(?string $referenceAnswer): ?array
    {
        if (blank($referenceAnswer)) {
            return null;
        }

        $tokens = collect(preg_split('/[^a-z0-9]+/i', strtolower($referenceAnswer)) ?: [])
            ->filter(fn (?string $token): bool => filled($token) && strlen($token) > 3)
            ->unique()
            ->take(8)
            ->values()
            ->all();

        return $tokens === [] ? null : $tokens;
    }
}
