<?php

namespace App\Services\Imports;

class MarkSchemeParser
{
    public function parse(array $pages): array
    {
        return $this->extractMarkEntries($pages);
    }

    public function extractMarkEntries(array $pages): array
    {
        $entries = [];
        $current = null;
        $started = false;
        $sortOrder = 1;

        foreach ($pages as $page) {
            $lines = preg_split('/\n+/', (string) ($page['text'] ?? '')) ?: [];

            foreach ($lines as $line) {
                $text = trim($line);

                if ($text === '') {
                    continue;
                }

                if (preg_match('/^(\d+(?:\([a-z0-9ivxlcdm]+\))+)[\s:.-]*(.*)$/i', $text, $matches)) {
                    $started = true;

                    if ($current !== null) {
                        $entries[] = $this->normalizeAnswerBlock($current);
                    }

                    $current = [
                        'question_key' => $this->normalizeQuestionKey($matches[1]),
                        'answer_text' => trim((string) ($matches[2] ?? '')),
                        'marks' => $this->extractMarks($text),
                        'page_number' => (int) $page['page_number'],
                        'sort_order' => $sortOrder++,
                        'raw_breakdown' => [],
                    ];

                    continue;
                }

                if (! $started) {
                    continue;
                }

                if ($current !== null) {
                    $current['raw_breakdown'][] = $text;
                }
            }
        }

        if ($current !== null) {
            $entries[] = $this->normalizeAnswerBlock($current);
        }

        return $entries;
    }

    public function normalizeAnswerBlock(array $entry): array
    {
        $answerParts = array_filter([
            preg_replace('/\s*\[(\d{1,3})\]\s*$/', '', (string) ($entry['answer_text'] ?? '')),
            ...($entry['raw_breakdown'] ?? []),
        ], fn ($value) => trim((string) $value) !== '');

        return [
            'question_key' => $this->normalizeQuestionKey((string) $entry['question_key']),
            'answer_text' => trim(implode("\n", $answerParts)),
            'marks' => $entry['marks'] ?? null,
            'page_number' => (int) ($entry['page_number'] ?? 1),
            'sort_order' => (int) ($entry['sort_order'] ?? 1),
            'raw_breakdown' => array_values($entry['raw_breakdown'] ?? []),
            'raw_payload' => $entry,
        ];
    }

    private function normalizeQuestionKey(string $key): string
    {
        return strtolower(preg_replace('/\s+/', '', $key) ?? $key);
    }

    private function extractMarks(string $text): ?int
    {
        if (preg_match('/\[(\d{1,3})\]\s*$/', $text, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/\b(\d{1,2})\s*marks?\b/i', $text, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }
}
