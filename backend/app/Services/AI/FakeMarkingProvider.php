<?php

namespace App\Services\AI;

use App\Services\Marking\Contracts\MarkingProvider;

class FakeMarkingProvider implements MarkingProvider
{
    public function __construct(private readonly string $model = 'deterministic-reviewer') {}

    public function providerName(): string
    {
        return 'fake';
    }

    public function modelName(): string
    {
        return $this->model;
    }

    public function generateMarking(array $prompt): array
    {
        $question = $prompt['context']['question'];
        $answer = trim((string) data_get($prompt, 'context.answer.student_answer'));
        $reference = trim((string) data_get($question, 'reference_answer'));
        $maxMarks = (int) data_get($question, 'max_marks', 0);

        $referenceWords = collect(preg_split('/\W+/', strtolower($reference)) ?: [])
            ->filter(fn (string $word) => strlen($word) > 3)
            ->unique()
            ->values();
        $answerWords = collect(preg_split('/\W+/', strtolower($answer)) ?: [])->filter()->unique()->values();

        $matches = $referenceWords->filter(fn (string $word) => $answerWords->contains($word))->values();
        $ratio = $referenceWords->isEmpty() ? 0.5 : min(1, $matches->count() / max(1, $referenceWords->count()));
        $awarded = max(0, min($maxMarks, (int) round($maxMarks * $ratio)));

        $result = [
            'awarded_marks' => $awarded,
            'reasoning' => $awarded === $maxMarks
                ? 'The answer covers the core points expected by the reference answer and rubric.'
                : 'The answer includes some relevant material but misses part of the expected marking points.',
            'feedback' => $awarded === $maxMarks
                ? 'Keep using direct exam wording and complete coverage of each required point.'
                : 'Add more explicit mark-scheme terminology and make sure each required point is stated clearly.',
            'strengths' => $matches->take(3)->map(fn (string $word) => 'Included key idea: '.$word)->values()->all(),
            'mistakes' => $referenceWords->reject(fn (string $word) => $answerWords->contains($word))->take(3)->map(fn (string $word) => 'Missing key point: '.$word)->values()->all(),
            'ai_confidence' => round(0.55 + ($ratio * 0.4), 2),
        ];

        return [
            'request_payload' => [
                'provider' => $this->providerName(),
                'prompt' => [
                    'system' => $prompt['system'],
                    'user' => $prompt['user'],
                ],
                'context' => $prompt['context'],
            ],
            'response_payload' => [
                'content' => json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            ],
            'content' => json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        ];
    }
}
