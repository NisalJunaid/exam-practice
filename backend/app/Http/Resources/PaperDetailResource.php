<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaperDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'paperCode' => $this->paper_code,
            'year' => $this->year,
            'session' => $this->session,
            'durationMinutes' => $this->duration_minutes,
            'totalMarks' => $this->total_marks,
            'instructions' => $this->instructions,
            'subject' => [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
                'code' => $this->subject->code,
                'examBoard' => $this->subject->examBoard->name,
                'examLevel' => $this->subject->examLevel->name,
            ],
            'questions' => $this->questions->map(fn ($question) => [
                'id' => $question->id,
                'questionNumber' => $question->question_number,
                'questionKey' => $question->question_key,
                'questionText' => $question->question_text,
                'maxMarks' => $question->max_marks,
                'orderIndex' => $question->order_index,
                'stemContext' => $question->stem_context,
            ])->values(),
        ];
    }
}
