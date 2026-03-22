<?php

namespace App\Services\Imports;

use App\Enums\ImportMatchStatus;

class QuestionMarkSchemeMatcher
{
    public function match(array $questionNodes, array $markEntries): array
    {
        $questionGroups = $this->groupByNormalizedKey($questionNodes);
        $markGroups = $this->groupByNormalizedKey($markEntries);
        $allKeys = array_values(array_unique(array_merge(array_keys($questionGroups), array_keys($markGroups))));
        $matched = [];

        foreach ($allKeys as $key) {
            $questions = $questionGroups[$key] ?? [];
            $schemes = $markGroups[$key] ?? [];

            if (count($questions) === 1 && count($schemes) === 1) {
                $matched[] = $this->composeItem($questions[0], $schemes[0], ImportMatchStatus::Matched);

                continue;
            }

            if (count($questions) > 1 || count($schemes) > 1) {
                foreach ($questions ?: [null] as $question) {
                    $matched[] = $this->composeItem($question, $schemes[0] ?? null, ImportMatchStatus::Ambiguous, $schemes);
                }

                if ($questions === []) {
                    foreach ($schemes as $scheme) {
                        $matched[] = $this->composeItem(null, $scheme, ImportMatchStatus::Ambiguous, $schemes);
                    }
                }

                continue;
            }

            if ($questions !== []) {
                foreach ($questions as $question) {
                    $matched[] = $this->composeItem($question, null, ImportMatchStatus::PaperOnly);
                }

                continue;
            }

            foreach ($schemes as $scheme) {
                $matched[] = $this->composeItem(null, $scheme, ImportMatchStatus::SchemeOnly);
            }
        }

        usort($matched, fn (array $left, array $right) => ($left['order_index'] <=> $right['order_index']) ?: strcmp((string) $left['question_key'], (string) $right['question_key']));

        return array_values($matched);
    }

    public function matchExactKeys(array $questionNodes, array $markEntries): array
    {
        return array_values(array_filter($this->match($questionNodes, $markEntries), fn (array $item): bool => $item['match_status'] === ImportMatchStatus::Matched));
    }

    public function findAmbiguousItems(array $questionNodes, array $markEntries): array
    {
        return array_values(array_filter($this->match($questionNodes, $markEntries), fn (array $item): bool => $item['match_status'] === ImportMatchStatus::Ambiguous));
    }

    private function groupByNormalizedKey(array $items): array
    {
        $grouped = [];

        foreach ($items as $item) {
            $key = $this->normalizeQuestionKey((string) ($item['question_key'] ?? ''));

            if ($key === '') {
                continue;
            }

            $grouped[$key][] = $item;
        }

        return $grouped;
    }

    private function composeItem(?array $question, ?array $scheme, ImportMatchStatus $status, array $contextSchemes = []): array
    {
        $questionKey = $this->normalizeQuestionKey((string) ($question['question_key'] ?? $scheme['question_key'] ?? ''));
        $questionMarks = $question['marks'] ?? null;
        $schemeMarks = $scheme['marks'] ?? null;
        $resolvedMarks = $questionMarks ?? $schemeMarks;

        return [
            'question_key' => $questionKey,
            'parent_key' => $question['parent_key'] ?? null,
            'question_number' => $question['question_number'] ?? ($questionKey !== '' ? strtok($questionKey, '(') : null),
            'stem_context' => $question['stem_context'] ?? null,
            'question_text' => $question['question_text'] ?? 'Missing question paper entry for '.$questionKey,
            'reference_answer' => $scheme['answer_text'] ?? null,
            'marking_guidelines' => $scheme['answer_text'] ?? null,
            'question_paper_marks' => $questionMarks,
            'mark_scheme_marks' => $schemeMarks,
            'resolved_max_marks' => $resolvedMarks,
            'match_status' => $status,
            'question_page_number' => $question['page_number'] ?? null,
            'mark_scheme_page_number' => $scheme['page_number'] ?? null,
            'order_index' => (int) ($question['sort_order'] ?? $scheme['sort_order'] ?? 1),
            'is_approved' => $status === ImportMatchStatus::Matched,
            'raw_question_payload' => $question,
            'raw_mark_scheme_payload' => $status === ImportMatchStatus::Ambiguous ? ['candidates' => $contextSchemes ?: [$scheme]] : $scheme,
        ];
    }

    private function normalizeQuestionKey(string $key): string
    {
        return strtolower(preg_replace('/\s+/', '', $key) ?? $key);
    }
}
