<?php

namespace App\Services\Marking;

use App\Models\AttemptAnswer;
use App\Models\PaperQuestion;
use App\Services\Marking\Exceptions\InvalidMarkingResponseException;

class MarkingResponseValidator
{
    /**
     * @param  string|array<string, mixed>  $payload
     * @return array{awarded_marks:int, reasoning:string, feedback:string, strengths:array<int,string>, mistakes:array<int,string>, ai_confidence:float}
     */
    public function validateAndNormalize(string|array $payload, PaperQuestion $question, ?AttemptAnswer $answer): array
    {
        $decoded = is_string($payload)
            ? json_decode($payload, true)
            : $payload;

        if (! is_array($decoded)) {
            throw new InvalidMarkingResponseException('AI marking output was not valid JSON.');
        }

        $studentAnswer = trim((string) $answer?->student_answer);
        $isBlank = $answer?->is_blank ?? ($studentAnswer === '');

        $awarded = $decoded['awarded_marks'] ?? null;
        if (! is_numeric($awarded)) {
            throw new InvalidMarkingResponseException('AI marking output did not include a numeric awarded_marks field.');
        }

        $reasoning = $this->normalizeString($decoded['reasoning'] ?? null);
        $feedback = $this->normalizeString($decoded['feedback'] ?? null);

        if ($reasoning === '' || $feedback === '') {
            throw new InvalidMarkingResponseException('AI marking output must include reasoning and feedback strings.');
        }

        $normalized = [
            'awarded_marks' => max(0, min($question->max_marks, (int) round((float) $awarded))),
            'reasoning' => $reasoning,
            'feedback' => $feedback,
            'strengths' => $this->normalizeStringList($decoded['strengths'] ?? []),
            'mistakes' => $this->normalizeStringList($decoded['mistakes'] ?? []),
            'ai_confidence' => $this->normalizeConfidence($decoded['ai_confidence'] ?? null),
        ];

        if ($isBlank) {
            $normalized['awarded_marks'] = 0;
            $normalized['strengths'] = [];
            $normalized['mistakes'] = array_values(array_unique(array_filter([
                'Blank response',
                ...$normalized['mistakes'],
            ])));

            if (stripos($normalized['reasoning'], 'blank') === false && stripos($normalized['reasoning'], 'no answer') === false) {
                $normalized['reasoning'] = 'No answer was submitted, so no marks could be awarded.';
            }

            if ($normalized['feedback'] === '') {
                $normalized['feedback'] = 'Write at least one direct response using the key scientific terms from the mark scheme.';
            }
        }

        return $normalized;
    }

    public function blankAnswerResult(PaperQuestion $question): array
    {
        return [
            'awarded_marks' => 0,
            'reasoning' => 'No answer was submitted, so no marks could be awarded.',
            'feedback' => 'Write at least one direct response using the key terms expected by the mark scheme.',
            'strengths' => [],
            'mistakes' => ['Blank response'],
            'ai_confidence' => 1.0,
        ];
    }

    private function normalizeString(mixed $value): string
    {
        if (! is_string($value)) {
            return '';
        }

        return trim(preg_replace('/\s+/', ' ', $value) ?? '');
    }

    /**
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->map(fn (mixed $item) => $this->normalizeString($item))
            ->filter()
            ->values()
            ->take(5)
            ->all();
    }

    private function normalizeConfidence(mixed $value): float
    {
        if (! is_numeric($value)) {
            return 0.0;
        }

        return round(max(0, min(1, (float) $value)), 2);
    }
}
