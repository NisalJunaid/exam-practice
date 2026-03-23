<?php

namespace App\Services\Papers;

use App\Models\ExamBoard;
use App\Models\ExamLevel;
use App\Models\Paper;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PaperCatalogService
{
    public function getCatalogFilters(): array
    {
        $publishedSubjects = Subject::query()
            ->whereHas('papers', fn (Builder $query) => $query->published())
            ->with(['examBoard:id,name,slug', 'examLevel:id,name,slug'])
            ->orderBy('name')
            ->get();

        return [
            'examBoards' => ExamBoard::query()
                ->whereHas('subjects.papers', fn (Builder $query) => $query->published())
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->values()
                ->all(),
            'examLevels' => ExamLevel::query()
                ->whereHas('subjects.papers', fn (Builder $query) => $query->published())
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->values()
                ->all(),
            'subjects' => $publishedSubjects
                ->map(fn (Subject $subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'slug' => $subject->slug,
                    'code' => $subject->code,
                    'examBoardId' => $subject->exam_board_id,
                    'examBoard' => $subject->examBoard?->name,
                    'examLevelId' => $subject->exam_level_id,
                    'examLevel' => $subject->examLevel?->name,
                ])
                ->values()
                ->all(),
            'years' => Paper::query()
                ->published()
                ->whereNotNull('year')
                ->distinct()
                ->orderByDesc('year')
                ->pluck('year')
                ->values()
                ->all(),
            'sessions' => Paper::query()
                ->published()
                ->whereNotNull('session')
                ->distinct()
                ->orderBy('session')
                ->pluck('session')
                ->values()
                ->all(),
        ];
    }

    public function searchPublishedPapers(array $filters = []): Collection
    {
        return Paper::query()
            ->published()
            ->with(['subject.examBoard', 'subject.examLevel'])
            ->when($filters['subject_id'] ?? null, fn (Builder $query, int $subjectId) => $query->where('subject_id', $subjectId))
            ->when($filters['year'] ?? null, fn (Builder $query, int $year) => $query->where('year', $year))
            ->when($filters['session'] ?? null, fn (Builder $query, string $session) => $query->where('session', $session))
            ->when($filters['exam_board_id'] ?? null, fn (Builder $query, int $boardId) => $query->whereHas('subject', fn (Builder $subjectQuery) => $subjectQuery->where('exam_board_id', $boardId)))
            ->when($filters['exam_level_id'] ?? null, fn (Builder $query, int $levelId) => $query->whereHas('subject', fn (Builder $subjectQuery) => $subjectQuery->where('exam_level_id', $levelId)))
            ->when($filters['q'] ?? null, function (Builder $query, string $search) {
                $term = trim($search);
                if ($term === '') {
                    return;
                }

                $query->where(function (Builder $searchQuery) use ($term) {
                    $searchQuery
                        ->where('title', 'like', "%{$term}%")
                        ->orWhere('paper_code', 'like', "%{$term}%")
                        ->orWhereHas('subject', fn (Builder $subjectQuery) => $subjectQuery
                            ->where('name', 'like', "%{$term}%")
                            ->orWhere('code', 'like', "%{$term}%"));
                });
            })
            ->orderByDesc('year')
            ->orderBy('title')
            ->get();
    }

    public function getPaperForStudent(Paper $paper): Paper
    {
        return $paper->load(['subject.examBoard', 'subject.examLevel', 'questions.visualAssets']);
    }
}
