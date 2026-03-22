<?php

namespace App\Http\Resources\Student;

use App\Enums\PaperAttemptStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaperAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $showReview = in_array($this->status, [PaperAttemptStatus::Completed, PaperAttemptStatus::Failed], true);

        return [
            'id' => $this->id,
            'status' => $this->status?->value,
            'startedAt' => optional($this->started_at)->toIso8601String(),
            'submittedAt' => optional($this->submitted_at)->toIso8601String(),
            'completedAt' => optional($this->completed_at)->toIso8601String(),
            'totalAwardedMarks' => $this->total_awarded_marks,
            'totalMaxMarks' => $this->total_max_marks,
            'markingSummary' => $showReview ? $this->marking_summary : null,
            'paper' => [
                'id' => $this->paper->id,
                'title' => $this->paper->title,
                'subject' => $this->paper->subject->name,
            ],
            'questions' => $this->paper->questions->map(function ($question) use ($showReview) {
                $answer = $this->answers->firstWhere('paper_question_id', $question->id);
                $marking = $this->markings->firstWhere('paper_question_id', $question->id);

                return [
                    'id' => $question->id,
                    'questionNumber' => $question->question_number,
                    'questionKey' => $question->question_key,
                    'questionText' => $question->question_text,
                    'maxMarks' => $question->max_marks,
                    'studentAnswer' => $answer?->student_answer,
                    'isBlank' => $answer?->is_blank ?? true,
                    'review' => $showReview && $marking ? [
                        'awardedMarks' => $marking->awarded_marks,
                        'maxMarks' => $marking->max_marks,
                        'reasoning' => $marking->reasoning,
                        'feedback' => $marking->feedback,
                        'strengths' => $marking->strengths ?? [],
                        'mistakes' => $marking->mistakes ?? [],
                        'referenceAnswer' => $question->reference_answer,
                        'markingGuidelines' => $question->marking_guidelines,
                    ] : null,
                ];
            })->values(),
        ];
    }
}
