<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPaperResource extends JsonResource
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
            'isPublished' => $this->is_published,
            'questionCount' => $this->whenCounted('questions', fn (): int => (int) $this->questions_count),
            'sourceQuestionPaperPath' => $this->source_question_paper_path,
            'sourceMarkSchemePath' => $this->source_mark_scheme_path,
            'subject' => $this->subject ? [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
                'slug' => $this->subject->slug,
                'code' => $this->subject->code,
                'examBoard' => $this->subject->examBoard ? [
                    'id' => $this->subject->examBoard->id,
                    'name' => $this->subject->examBoard->name,
                    'slug' => $this->subject->examBoard->slug,
                ] : null,
                'examLevel' => $this->subject->examLevel ? [
                    'id' => $this->subject->examLevel->id,
                    'name' => $this->subject->examLevel->name,
                    'slug' => $this->subject->examLevel->slug,
                ] : null,
            ] : null,
            'questions' => AdminQuestionResource::collection($this->whenLoaded('questions')),
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
