<?php

namespace App\Services\Attempts;

use App\Http\Resources\AttemptAnswerAssetResource;
use App\Http\Resources\QuestionVisualAssetResource;
use App\Models\PaperAttempt;

class AttemptReviewBuilder
{
    public function buildResultsPayload(PaperAttempt $attempt): array
    {
        return [
            'status' => $attempt->status?->value,
            'totalAwardedMarks' => $attempt->total_awarded_marks,
            'totalMaxMarks' => $attempt->total_max_marks,
            'markingSummary' => $attempt->marking_summary,
            'questions' => $attempt->paper->questions->map(function ($question) use ($attempt) {
                $marking = $attempt->markings->firstWhere('paper_question_id', $question->id);

                return [
                    'id' => $question->id,
                    'questionNumber' => $question->question_number,
                    'questionKey' => $question->question_key,
                    'maxMarks' => $question->max_marks,
                    'awardedMarks' => $marking?->awarded_marks,
                ];
            })->values()->all(),
        ];
    }

    public function buildReviewPayload(PaperAttempt $attempt): array
    {
        return [
            'markingSummary' => $attempt->marking_summary,
            'questions' => $attempt->paper->questions->map(function ($question) use ($attempt) {
                $answer = $attempt->answers->firstWhere('paper_question_id', $question->id);
                $marking = $attempt->markings->firstWhere('paper_question_id', $question->id);

                return [
                    'id' => $question->id,
                    'questionNumber' => $question->question_number,
                    'questionKey' => $question->question_key,
                    'questionText' => $question->question_text,
                    'questionType' => $question->question_type?->value ?? $question->question_type,
                    'answerInteractionType' => $question->answer_interaction_type?->value ?? $question->answer_interaction_type,
                    'interactionConfig' => $question->interaction_config ?? [],
                    'stemContext' => $question->stem_context,
                    'visualAssets' => QuestionVisualAssetResource::collection($question->visualAssets)->resolve(),
                    'studentAnswer' => $answer?->student_answer,
                    'structuredAnswer' => $answer?->structured_answer,
                    'answerAssets' => AttemptAnswerAssetResource::collection($answer?->assets ?? collect())->resolve(),
                    'isBlank' => $answer?->is_blank ?? true,
                    'awardedMarks' => $marking?->awarded_marks,
                    'maxMarks' => $question->max_marks,
                    'reasoning' => $marking?->reasoning,
                    'feedback' => $marking?->feedback,
                    'strengths' => $marking?->strengths ?? [],
                    'mistakes' => $marking?->mistakes ?? [],
                    'referenceAnswer' => $question->reference_answer,
                    'markingGuidelines' => $question->marking_guidelines,
                ];
            })->values()->all(),
        ];
    }
}
