<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status?->value,
            'startedAt' => optional($this->started_at)->toIso8601String(),
            'submittedAt' => optional($this->submitted_at)->toIso8601String(),
            'completedAt' => optional($this->completed_at)->toIso8601String(),
            'deadlineAt' => optional($this->deadlineAt())->toIso8601String(),
            'remainingSeconds' => $this->remainingSeconds(),
            'isTimedOut' => $this->hasTimedOut(),
            'totalAwardedMarks' => $this->total_awarded_marks,
            'totalMaxMarks' => $this->total_max_marks,
            'markingSummary' => $this->marking_summary,
            'paper' => [
                'id' => $this->paper->id,
                'title' => $this->paper->title,
                'subject' => $this->paper->subject->name,
                'paperCode' => $this->paper->paper_code,
                'durationMinutes' => $this->paper->duration_minutes,
            ],
            'questions' => $this->paper->questions->map(function ($question) {
                $answer = $this->answers->firstWhere('paper_question_id', $question->id);

                return [
                    'id' => $question->id,
                    'answerId' => $answer?->id,
                    'questionNumber' => $question->question_number,
                    'questionKey' => $question->question_key,
                    'questionText' => $question->question_text,
                    'questionType' => $question->question_type?->value ?? $question->question_type,
                    'answerInteractionType' => $question->answer_interaction_type?->value ?? $question->answer_interaction_type,
                    'interactionConfig' => $question->interaction_config ?? [],
                    'stemContext' => $question->stem_context,
                    'maxMarks' => $question->max_marks,
                    'requiresVisualReference' => $question->requires_visual_reference,
                    'visualReferenceType' => $question->visual_reference_type?->value ?? $question->visual_reference_type,
                    'visualReferenceNote' => $question->visual_reference_note,
                    'hasVisual' => $question->has_visual,
                    'visualAssets' => QuestionVisualAssetResource::collection($question->visualAssets)->resolve(),
                    'studentAnswer' => $answer?->student_answer,
                    'structuredAnswer' => $answer?->structured_answer,
                    'answerAssets' => AttemptAnswerAssetResource::collection($answer?->assets ?? collect())->resolve(),
                    'isBlank' => $answer?->is_blank ?? true,
                    'submittedAt' => optional($answer?->submitted_at)->toIso8601String(),
                    'updatedAt' => optional($question->updated_at)->toIso8601String(),
                ];
            })->values(),
        ];
    }
}
