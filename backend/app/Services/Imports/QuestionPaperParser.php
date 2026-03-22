<?php

namespace App\Services\Imports;

use Illuminate\Support\Str;

class QuestionPaperParser
{
    public function parse(array $pages): array
    {
        $tree = $this->buildQuestionTree($this->flattenPageLines($pages));

        return $this->flattenAnswerableNodes($tree);
    }

    public function buildQuestionTree(array $lines): array
    {
        $roots = [];
        $stack = [];
        $currentMainKey = null;
        $mainStem = '';
        $sortOrder = 1;

        foreach ($lines as $line) {
            $text = trim((string) ($line['text'] ?? ''));

            if ($text === '') {
                continue;
            }

            if (preg_match('/^(\d+)(?!\()\s*(.*)$/', $text, $mainMatch)) {
                $currentMainKey = $mainMatch[1];
                $mainStem = trim((string) ($mainMatch[2] ?? ''));
                $node = $this->makeNode($currentMainKey, null, '', $mainStem, $this->extractMarks($text), (int) $line['page_number'], $sortOrder++);
                $roots[$currentMainKey] = $node;
                $stack = [$currentMainKey => &$roots[$currentMainKey]];

                continue;
            }

            if ($currentMainKey === null) {
                continue;
            }

            if (preg_match('/^(\d+(?:\([a-z]\))+(?:\([ivxlcdm]+\))*)\s*(.*)$/i', $text, $fullMatch)) {
                $key = $this->normalizeQuestionKey($fullMatch[1]);
                $textWithoutKey = trim((string) ($fullMatch[2] ?? ''));
                $this->insertNode($roots, $stack, $key, $textWithoutKey, $line, $mainStem, $sortOrder++);

                continue;
            }

            if (preg_match('/^((?:\([a-z]\))+(?:\([ivxlcdm]+\))*)\s*(.*)$/i', $text, $subMatch)) {
                $key = $this->normalizeQuestionKey($currentMainKey.$subMatch[1]);
                $textWithoutKey = trim((string) ($subMatch[2] ?? ''));
                $this->insertNode($roots, $stack, $key, $textWithoutKey, $line, $mainStem, $sortOrder++);

                continue;
            }

            if ($stack !== []) {
                $leafKey = array_key_last($stack);
                $stack[$leafKey]['body'][] = $text;

                continue;
            }

            $mainStem = trim($mainStem.' '.$text);
        }

        return array_values($roots);
    }

    public function flattenAnswerableNodes(array $tree): array
    {
        $items = [];

        foreach ($tree as $node) {
            $this->flattenNode($node, $items);
        }

        usort($items, fn (array $left, array $right) => ($left['sort_order'] <=> $right['sort_order']) ?: strcmp($left['question_key'], $right['question_key']));

        return array_values($items);
    }

    private function flattenPageLines(array $pages): array
    {
        return collect($pages)->flatMap(function (array $page): array {
            return collect(preg_split('/\n+/', (string) ($page['text'] ?? '')) ?: [])->map(fn (string $line): array => [
                'page_number' => (int) $page['page_number'],
                'text' => trim($line),
            ])->all();
        })->all();
    }

    private function flattenNode(array $node, array &$items): void
    {
        $children = $node['children'] ?? [];

        if ($children === []) {
            $questionText = trim(implode("\n", array_filter([$node['question_text'], ...($node['body'] ?? [])])));

            if ($node['parent_key'] !== null || $questionText !== '') {
                $items[] = [
                    'question_key' => $node['question_key'],
                    'parent_key' => $node['parent_key'],
                    'question_number' => Str::before($node['question_key'], '('),
                    'stem_context' => $node['stem_context'],
                    'question_text' => $questionText !== '' ? $questionText : ($node['stem_context'] ?: $node['question_key']),
                    'marks' => $node['marks'],
                    'page_number' => $node['page_number'],
                    'sort_order' => $node['sort_order'],
                    'has_visual' => ! empty($node['visual_markers'] ?? []),
                    'raw_payload' => [
                        'body' => $node['body'] ?? [],
                        'visual_markers' => $node['visual_markers'] ?? [],
                    ],
                ];
            }

            return;
        }

        foreach ($children as $child) {
            $this->flattenNode($child, $items);
        }
    }

    private function insertNode(array &$roots, array &$stack, string $key, string $text, array $line, string $mainStem, int $sortOrder): void
    {
        $segments = $this->segmentsForKey($key);
        $parentKey = count($segments) > 1 ? $this->buildKeyFromSegments(array_slice($segments, 0, -1)) : null;
        $stemContext = $parentKey && isset($stack[$parentKey])
            ? trim(implode("\n", array_filter([$stack[$parentKey]['stem_context'] ?? '', $stack[$parentKey]['question_text'] ?? '', ...($stack[$parentKey]['body'] ?? [])])))
            : $mainStem;

        $node = $this->makeNode(
            $key,
            $parentKey,
            $stemContext,
            $this->stripMarks($text),
            $this->extractMarks($text),
            (int) $line['page_number'],
            $sortOrder,
            $this->extractVisualMarkers($text),
        );

        if ($parentKey === null) {
            $roots[$key] = $node;
            $stack = [$key => &$roots[$key]];

            return;
        }

        $parent = &$stack[$parentKey];
        $parent['children'][$key] = $node;
        $stack[$key] = &$parent['children'][$key];

        foreach (array_keys($stack) as $stackKey) {
            if (! str_starts_with($stackKey, $key) && $stackKey !== $key && ! str_starts_with($key, $stackKey)) {
                continue;
            }
        }
    }

    private function makeNode(string $questionKey, ?string $parentKey, string $stemContext, string $questionText, ?int $marks, int $pageNumber, int $sortOrder, array $visualMarkers = []): array
    {
        return [
            'question_key' => $questionKey,
            'parent_key' => $parentKey,
            'stem_context' => trim($stemContext),
            'question_text' => trim($questionText),
            'marks' => $marks,
            'page_number' => $pageNumber,
            'sort_order' => $sortOrder,
            'body' => [],
            'children' => [],
            'visual_markers' => $visualMarkers,
        ];
    }

    private function normalizeQuestionKey(string $key): string
    {
        $key = strtolower(preg_replace('/\s+/', '', $key) ?? $key);

        return preg_replace_callback('/\(([ivxlcdm]+)\)/i', fn (array $matches): string => '('.strtolower($matches[1]).')', $key) ?? $key;
    }

    private function segmentsForKey(string $key): array
    {
        preg_match_all('/\d+|\([^)]+\)/', $key, $matches);

        return $matches[0] ?? [$key];
    }

    private function buildKeyFromSegments(array $segments): string
    {
        $first = array_shift($segments);

        return (string) $first.implode('', $segments);
    }

    private function extractMarks(string $text): ?int
    {
        if (preg_match('/\[(?:total:\s*)?(\d{1,3})\]/i', $text, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    private function stripMarks(string $text): string
    {
        return trim((string) preg_replace('/\s*\[(?:total:\s*)?\d{1,3}\]\s*$/i', '', $text));
    }

    private function extractVisualMarkers(string $text): array
    {
        return preg_match_all('/\[(diagram|table|graph|image|figure)\]/i', $text, $matches) > 0
            ? array_values(array_unique(array_map('strtolower', $matches[1])))
            : [];
    }
}
