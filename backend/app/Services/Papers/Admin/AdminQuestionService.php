<?php

namespace App\Services\Papers\Admin;

use App\Models\Paper;
use App\Models\PaperQuestion;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminQuestionService
{
    public function create(Paper $paper, array $attributes): PaperQuestion
    {
        return DB::transaction(function () use ($paper, $attributes): PaperQuestion {
            $rubricAttributes = Arr::pull($attributes, 'rubric');
            $payload = $this->prepareQuestionPayload($paper, $attributes);

            $question = $paper->questions()->create($payload);

            if (is_array($rubricAttributes) && $this->hasRubricValues($rubricAttributes)) {
                $question->rubric()->create($rubricAttributes);
            }

            $this->syncPaperTotals($paper);

            return $this->load($question->fresh());
        });
    }

    public function get(PaperQuestion $question): PaperQuestion
    {
        return $this->load($question);
    }

    public function update(PaperQuestion $question, array $attributes): PaperQuestion
    {
        return DB::transaction(function () use ($question, $attributes): PaperQuestion {
            $rubricAttributes = Arr::pull($attributes, 'rubric');
            $payload = $this->prepareQuestionPayload($question->paper, $attributes, $question);

            $question->update($payload);

            if (is_array($rubricAttributes)) {
                $this->upsertRubric($question, $rubricAttributes);
            }

            $this->syncPaperTotals($question->paper);

            return $this->load($question->fresh());
        });
    }

    public function updateRubric(PaperQuestion $question, array $attributes): PaperQuestion
    {
        return DB::transaction(function () use ($question, $attributes): PaperQuestion {
            $this->upsertRubric($question, $attributes);

            return $this->load($question->fresh());
        });
    }

    public function delete(PaperQuestion $question): void
    {
        if ($question->attemptAnswers()->exists() || $question->attemptMarkings()->exists()) {
            throw ValidationException::withMessages([
                'question' => ['Questions with recorded attempt data cannot be deleted.'],
            ]);
        }

        DB::transaction(function () use ($question): void {
            $paper = $question->paper;
            $question->delete();
            $this->syncPaperTotals($paper);
        });
    }

    private function load(PaperQuestion $question): PaperQuestion
    {
        return $question->load(['paper.subject.examBoard', 'paper.subject.examLevel', 'rubric']);
    }

    private function prepareQuestionPayload(Paper $paper, array $attributes, ?PaperQuestion $question = null): array
    {
        if (array_key_exists('question_key', $attributes) && blank($attributes['question_key'])) {
            $attributes['question_key'] = null;
        }

        if (array_key_exists('question_number', $attributes) && blank($attributes['question_number'])) {
            unset($attributes['question_number']);
        }

        if (! array_key_exists('question_number', $attributes)) {
            $attributes['question_number'] = $this->inferQuestionNumber(
                $attributes['question_key'] ?? $question?->question_key,
                $attributes['order_index'] ?? $question?->order_index,
                $question?->question_number,
            );
        }

        $this->ensureUniqueQuestionMetadata($paper, $attributes, $question);

        return $attributes;
    }

    private function inferQuestionNumber(?string $questionKey, ?int $orderIndex, ?string $fallback = null): string
    {
        if (filled($questionKey) && preg_match('/^([0-9]+)/', $questionKey, $matches) === 1) {
            return $matches[1];
        }

        if (filled($fallback)) {
            return $fallback;
        }

        return (string) ($orderIndex ?? 1);
    }

    private function ensureUniqueQuestionMetadata(Paper $paper, array $attributes, ?PaperQuestion $question = null): void
    {
        if (array_key_exists('order_index', $attributes)) {
            $orderIndexExists = $paper->questions()
                ->where('order_index', $attributes['order_index'])
                ->when($question, fn ($query) => $query->whereKeyNot($question->getKey()))
                ->exists();

            if ($orderIndexExists) {
                throw ValidationException::withMessages([
                    'order_index' => ['Each question in a paper must have a unique order index.'],
                ]);
            }
        }

        if (array_key_exists('question_key', $attributes) && filled($attributes['question_key'])) {
            $questionKey = Str::lower(trim((string) $attributes['question_key']));

            $questionKeyExists = $paper->questions()
                ->whereRaw('LOWER(question_key) = ?', [$questionKey])
                ->when($question, fn ($query) => $query->whereKeyNot($question->getKey()))
                ->exists();

            if ($questionKeyExists) {
                throw ValidationException::withMessages([
                    'question_key' => ['Question keys must be unique within a paper.'],
                ]);
            }
        }

        if (! array_key_exists('question_key', $attributes) && ! array_key_exists('question_number', $attributes) && ! $question) {
            throw ValidationException::withMessages([
                'question_key' => ['Provide a question key or a question number for each question.'],
            ]);
        }
    }

    private function upsertRubric(PaperQuestion $question, array $attributes): void
    {
        if (! $this->hasRubricValues($attributes)) {
            $question->rubric()->delete();

            return;
        }

        $question->rubric()->updateOrCreate(
            ['paper_question_id' => $question->id],
            $attributes,
        );
    }

    private function hasRubricValues(array $attributes): bool
    {
        foreach ($attributes as $value) {
            if (is_array($value) && $value !== []) {
                return true;
            }

            if (! is_array($value) && filled($value)) {
                return true;
            }
        }

        return false;
    }

    private function syncPaperTotals(Paper $paper): void
    {
        $paper->update(['total_marks' => $paper->calculateTotalMarks()]);
    }
}
