<?php

namespace App\Services\Imports;

use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class JsonImportValidator
{
    public function validate(string|array $payload): array
    {
        $decoded = is_array($payload) ? $payload : json_decode($payload, true);

        if (! is_array($decoded)) {
            throw ValidationException::withMessages([
                'json' => 'The import payload must be valid JSON representing an object.',
            ]);
        }

        $paper = $decoded['paper'] ?? null;
        $questions = $decoded['questions'] ?? null;

        if (! is_array($paper)) {
            throw ValidationException::withMessages(['paper' => 'The payload must include a paper object.']);
        }

        if (! is_array($questions) || $questions === []) {
            throw ValidationException::withMessages(['questions' => 'The payload must include at least one question.']);
        }

        $normalizedPaper = [
            'title' => $this->requireString($paper, 'title', 'paper'),
            'board' => $this->requireString($paper, 'board', 'paper'),
            'level' => $this->requireString($paper, 'level', 'paper'),
            'subject' => $this->requireString($paper, 'subject', 'paper'),
            'paper_code' => $this->requireString($paper, 'paper_code', 'paper'),
            'session' => $this->requireString($paper, 'session', 'paper'),
            'year' => $this->requireInteger($paper, 'year', 'paper', minimum: 0),
            'duration_minutes' => $this->requireInteger($paper, 'duration_minutes', 'paper', minimum: 0),
            'total_marks' => $this->requireInteger($paper, 'total_marks', 'paper', minimum: 0),
            'instructions' => $this->nullableString($paper, 'instructions') ?? '',
        ];

        $normalizedQuestions = [];

        foreach ($questions as $index => $question) {
            if (! is_array($question)) {
                throw ValidationException::withMessages(["questions.$index" => 'Each question must be an object.']);
            }

            $questionType = $question['question_type'] ?? QuestionType::ShortAnswer->value;
            if (! in_array($questionType, array_column(QuestionType::cases(), 'value'), true)) {
                throw ValidationException::withMessages(["questions.$index.question_type" => 'Unsupported question_type value.']);
            }

            $requiresVisualReference = (bool) ($question['requires_visual_reference'] ?? false);
            $flags = is_array($question['flags'] ?? null) ? $question['flags'] : [];
            $hasVisualFlag = (bool) ($flags['has_visual'] ?? false);
            $hasVisual = $requiresVisualReference || $hasVisualFlag;
            $visualReferenceType = $question['visual_reference_type'] ?? null;

            if ($visualReferenceType !== null && ! in_array($visualReferenceType, array_column(VisualReferenceType::cases(), 'value'), true)) {
                throw ValidationException::withMessages(["questions.$index.visual_reference_type" => 'Unsupported visual_reference_type value.']);
            }

            if ($requiresVisualReference && $visualReferenceType === null) {
                throw ValidationException::withMessages(["questions.$index.visual_reference_type" => 'visual_reference_type is required when requires_visual_reference is true.']);
            }

            $source = is_array($question['source'] ?? null) ? $question['source'] : [];

            $normalizedQuestions[] = [
                'question_key' => $this->requireString($question, 'question_key', $index),
                'parent_key' => $this->nullableString($question, 'parent_key'),
                'sort_order' => $this->requireInteger($question, 'sort_order', $index, minimum: 0),
                'question_type' => $questionType,
                'stem_context' => $this->nullableString($question, 'stem_context'),
                'question_text' => $this->requireString($question, 'question_text', $index),
                'max_marks' => $this->requireInteger($question, 'max_marks', $index, minimum: 0),
                'reference_answer' => $this->nullableString($question, 'reference_answer'),
                'marking_guidelines' => $this->nullableString($question, 'marking_guidelines'),
                'sample_full_mark_answer' => $this->nullableString($question, 'sample_full_mark_answer'),
                'requires_visual_reference' => $requiresVisualReference,
                'visual_reference_type' => $visualReferenceType,
                'visual_reference_note' => $this->nullableString($question, 'visual_reference_note'),
                'source' => [
                    'question_page' => $this->nullableInteger($source, 'question_page'),
                    'mark_scheme_page' => $this->nullableInteger($source, 'mark_scheme_page'),
                ],
                'flags' => [
                    'needs_review' => (bool) ($flags['needs_review'] ?? false),
                    'has_visual' => $hasVisual,
                    'low_confidence_match' => (bool) ($flags['low_confidence_match'] ?? false),
                ],
            ];
        }

        return [
            'paper' => $normalizedPaper,
            'questions' => collect($normalizedQuestions)->sortBy('sort_order')->values()->all(),
        ];
    }

    private function requireString(array $data, string $key, string|int $context): string
    {
        $value = Arr::get($data, $key);

        if (! is_string($value) || trim($value) === '') {
            throw ValidationException::withMessages(["$context.$key" => ucfirst(str_replace('_', ' ', $key)).' is required.']);
        }

        return trim($value);
    }

    private function nullableString(array $data, string $key): ?string
    {
        $value = Arr::get($data, $key);

        if ($value === null || $value === '') {
            return null;
        }

        if (! is_string($value)) {
            throw ValidationException::withMessages([$key => ucfirst(str_replace('_', ' ', $key)).' must be a string or null.']);
        }

        return trim($value);
    }

    private function requireInteger(array $data, string $key, string|int $context, int $minimum = 0): int
    {
        $value = Arr::get($data, $key);

        if (! is_int($value) && ! ctype_digit((string) $value)) {
            throw ValidationException::withMessages(["$context.$key" => ucfirst(str_replace('_', ' ', $key)).' must be an integer.']);
        }

        $value = (int) $value;

        if ($value < $minimum) {
            throw ValidationException::withMessages(["$context.$key" => ucfirst(str_replace('_', ' ', $key))." must be at least {$minimum}."]);
        }

        return $value;
    }

    private function nullableInteger(array $data, string $key): ?int
    {
        $value = Arr::get($data, $key);

        if ($value === null || $value === '') {
            return null;
        }

        if (! is_int($value) && ! ctype_digit((string) $value)) {
            throw ValidationException::withMessages([$key => ucfirst(str_replace('_', ' ', $key)).' must be an integer or null.']);
        }

        return (int) $value;
    }
}
