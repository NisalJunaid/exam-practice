<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'paperId' => $this->paper_id,
            'questionNumber' => $this->question_number,
            'questionKey' => $this->question_key,
            'questionText' => $this->question_text,
            'referenceAnswer' => $this->reference_answer,
            'maxMarks' => $this->max_marks,
            'markingGuidelines' => $this->marking_guidelines,
            'sampleFullMarkAnswer' => $this->sample_full_mark_answer,
            'orderIndex' => $this->order_index,
            'stemContext' => $this->stem_context,
            'rubric' => $this->whenLoaded('rubric', function (): ?array {
                if (! $this->rubric) {
                    return null;
                }

                return [
                    'id' => $this->rubric->id,
                    'bandDescriptor' => $this->rubric->band_descriptor,
                    'keywordsExpected' => $this->rubric->keywords_expected ?? [],
                    'commonMistakes' => $this->rubric->common_mistakes ?? [],
                    'acceptableAlternatives' => $this->rubric->acceptable_alternatives ?? [],
                    'markerNotes' => $this->rubric->marker_notes,
                ];
            }),
            'paper' => $this->whenLoaded('paper', function (): ?array {
                if (! $this->paper) {
                    return null;
                }

                return [
                    'id' => $this->paper->id,
                    'title' => $this->paper->title,
                    'slug' => $this->paper->slug,
                    'isPublished' => $this->paper->is_published,
                    'totalMarks' => $this->paper->total_marks,
                ];
            }),
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
