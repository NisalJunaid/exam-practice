<?php

namespace App\Services\Papers\Admin;

use App\Models\Paper;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminPaperService
{
    public function list(): Collection
    {
        return Paper::query()
            ->with($this->relations())
            ->withCount('questions')
            ->latest('id')
            ->get();
    }

    public function create(array $attributes): Paper
    {
        return DB::transaction(function () use ($attributes): Paper {
            $payload = $this->preparePayload($attributes);
            $paper = Paper::query()->create($payload);

            return $this->load($paper);
        });
    }

    public function get(Paper $paper): Paper
    {
        return $this->load($paper);
    }

    public function update(Paper $paper, array $attributes): Paper
    {
        return DB::transaction(function () use ($paper, $attributes): Paper {
            $payload = $this->preparePayload($attributes, $paper);
            $paper->fill($payload);

            if ($paper->exists && $paper->questions()->exists()) {
                $paper->total_marks = $paper->calculateTotalMarks();
            }

            $paper->save();

            return $this->load($paper->fresh());
        });
    }

    public function delete(Paper $paper): void
    {
        if ($paper->attempts()->exists()) {
            throw ValidationException::withMessages([
                'paper' => ['Papers with student attempts cannot be deleted.'],
            ]);
        }

        DB::transaction(function () use ($paper): void {
            $paper->loadMissing(['questions.rubric']);
            $paper->delete();
        });
    }

    public function publish(Paper $paper): Paper
    {
        if (! $paper->questions()->exists()) {
            throw ValidationException::withMessages([
                'paper' => ['A paper must contain at least one question before it can be published.'],
            ]);
        }

        $paper->update([
            'is_published' => true,
            'total_marks' => $paper->calculateTotalMarks(),
        ]);

        return $this->load($paper->fresh());
    }

    public function unpublish(Paper $paper): Paper
    {
        $paper->update(['is_published' => false]);

        return $this->load($paper->fresh());
    }

    private function load(Paper $paper): Paper
    {
        return $paper->load($this->relations())->loadCount('questions');
    }

    private function relations(): array
    {
        return [
            'subject.examBoard',
            'subject.examLevel',
            'questions.rubric',
            'questions.visualAssets',
        ];
    }

    private function preparePayload(array $attributes, ?Paper $paper = null): array
    {
        if (array_key_exists('slug', $attributes) && blank($attributes['slug'])) {
            unset($attributes['slug']);
        }

        if (! array_key_exists('slug', $attributes) && blank($paper?->slug)) {
            $attributes['slug'] = Str::slug(($attributes['title'] ?? $paper?->title ?? 'paper').'-'.Str::lower(Str::random(8)));
        }

        if (array_key_exists('title', $attributes) && blank($attributes['title'])) {
            throw ValidationException::withMessages([
                'title' => ['The title field is required.'],
            ]);
        }

        if (! array_key_exists('total_marks', $attributes)) {
            $attributes['total_marks'] = $paper?->exists && $paper->questions()->exists()
                ? $paper->calculateTotalMarks()
                : 0;
        }

        return $attributes;
    }
}
