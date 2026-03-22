<?php

namespace App\Services\AI;

use App\Models\PaperQuestion;

class FakeMarkingProvider
{
    public function mark(PaperQuestion $question, ?string $studentAnswer): array
    {
        $studentAnswer = trim((string) $studentAnswer);
        $reference = trim((string) $question->reference_answer);

        if ($studentAnswer === '') {
            return [
                'awarded_marks' => 0,
                'reasoning' => 'No answer was submitted, so no marks could be awarded.',
                'feedback' => 'Write at least one direct response to the command word and include key facts from the mark scheme.',
                'strengths' => [],
                'mistakes' => ['Blank response'],
                'ai_confidence' => 0.99,
            ];
        }

        $referenceWords = collect(preg_split('/\W+/', strtolower($reference)) ?: [])
            ->filter(fn ($word) => strlen($word) > 3)
            ->unique()
            ->values();
        $answerWords = collect(preg_split('/\W+/', strtolower($studentAnswer)) ?: [])->unique();

        $matches = $referenceWords->filter(fn ($word) => $answerWords->contains($word));
        $ratio = $referenceWords->isEmpty() ? 0.5 : min(1, $matches->count() / max(1, $referenceWords->count()));
        $awarded = (int) round($question->max_marks * $ratio);
        $awarded = max(0, min($question->max_marks, $awarded));

        $strengths = $matches->take(3)->map(fn ($word) => 'Included key idea: '.$word)->values()->all();
        $mistakes = $referenceWords->reject(fn ($word) => $answerWords->contains($word))->take(3)->map(fn ($word) => 'Missing key point: '.$word)->values()->all();

        return [
            'awarded_marks' => $awarded,
            'reasoning' => $awarded === $question->max_marks
                ? 'The answer covers the core points expected by the stored rubric and reference answer.'
                : 'The answer includes some relevant points, but it misses parts of the stored reference answer and marking guidance.',
            'feedback' => $awarded === $question->max_marks
                ? 'Maintain this level of precision and structure in future answers.'
                : 'Add more explicit mark-scheme terminology and cover each required point in a short, direct structure.',
            'strengths' => $strengths,
            'mistakes' => $mistakes,
            'ai_confidence' => round(0.55 + ($ratio * 0.4), 2),
        ];
    }
}
