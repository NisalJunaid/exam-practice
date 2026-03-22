<?php

namespace App\Services\Papers;

use App\Models\Paper;
use Illuminate\Database\Eloquent\Collection;

class PaperCatalogService
{
    public function listPublished(): Collection
    {
        return Paper::query()
            ->published()
            ->with(['subject.examBoard', 'subject.examLevel'])
            ->orderByDesc('year')
            ->orderBy('title')
            ->get();
    }

    public function getPublishedPaper(Paper $paper): Paper
    {
        return $paper->load(['subject.examBoard', 'subject.examLevel', 'questions']);
    }
}
