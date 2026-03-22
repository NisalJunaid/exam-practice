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
            'subject' => $this->subject ? [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
                'code' => $this->subject->code,
                'examBoard' => $this->subject->examBoard?->name,
                'examLevel' => $this->subject->examLevel?->name,
            ] : null,
            'questions' => AdminQuestionResource::collection($this->whenLoaded('questions')),
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
