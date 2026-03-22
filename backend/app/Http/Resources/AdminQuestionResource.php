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
        ];
    }
}
