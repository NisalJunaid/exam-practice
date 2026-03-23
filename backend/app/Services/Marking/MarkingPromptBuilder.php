<?php

namespace App\Services\Marking;

use App\Models\AttemptAnswer;
use App\Models\PaperQuestion;

class MarkingPromptBuilder
{
    public function build(PaperQuestion $question, ?AttemptAnswer $answer): array
    {
        $studentAnswer = trim((string) $answer?->student_answer);
        $structuredAnswer = $answer?->structured_answer ?? [];
        $rubric = $question->rubric;
        $answerAssets = $answer?->relationLoaded('assets')
            ? $answer->assets
            : $answer?->assets()->get();

        $outputSchema = [
            'awarded_marks' => 'integer between 0 and max_marks',
            'reasoning' => 'string explaining the mark award',
            'feedback' => 'string giving concise next-step advice',
            'strengths' => 'array of short strings',
            'mistakes' => 'array of short strings',
            'ai_confidence' => 'number between 0 and 1',
        ];

        $system = implode("\n", [
            'You are an exam paper marker.',
            'Mark strictly against the supplied question, reference answer, max marks, and rubric.',
            'Return JSON only with no markdown fences or extra commentary.',
            'Never award more than max_marks or less than 0.',
            'If the answer is blank or irrelevant, award 0 marks and explain briefly.',
        ]);

        $userPayload = [
            'task' => 'Mark a single exam answer and return structured JSON.',
            'question' => [
                'question_number' => $question->question_number,
                'question_key' => $question->question_key,
                'question_text' => $question->question_text,
                'reference_answer' => $question->reference_answer,
                'max_marks' => $question->max_marks,
                'marking_guidelines' => $question->marking_guidelines,
                'rubric' => [
                    'band_descriptor' => $rubric?->band_descriptor,
                    'keywords_expected' => $rubric?->keywords_expected ?? [],
                    'common_mistakes' => $rubric?->common_mistakes ?? [],
                    'acceptable_alternatives' => $rubric?->acceptable_alternatives ?? [],
                    'marker_notes' => $rubric?->marker_notes,
                ],
            ],
            'answer' => [
                'attempt_answer_id' => $answer?->id,
                'student_answer' => $studentAnswer,
                'structured_answer' => $structuredAnswer,
                'answer_assets' => ($answerAssets ?? collect())->map(fn ($asset) => [
                    'id' => $asset->id,
                    'asset_type' => $asset->asset_type,
                    'mime_type' => $asset->mime_type,
                    'metadata' => $asset->metadata ?? [],
                    'url' => $asset->url,
                ])->values()->all(),
                'is_blank' => $answer?->is_blank ?? ($studentAnswer === ''),
            ],
            'required_output_schema' => $outputSchema,
        ];

        return [
            'system' => $system,
            'user' => json_encode($userPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'context' => $userPayload,
        ];
    }
}
