<?php

namespace App\Services\Imports;

use App\Services\Imports\Contracts\ImportAiAssistant;
use Illuminate\Support\Str;

class PaperMetadataExtractor
{
    public function __construct(private readonly ImportAiAssistant $assistant) {}

    public function extractFromQuestionPaper(array $pages): array
    {
        return $this->normalizeMetadata(array_merge(
            $this->extractWithRegex($pages),
            $this->assistant->extractMetadata($pages, 'question_paper'),
        ));
    }

    public function extractFromMarkScheme(array $pages): array
    {
        return $this->normalizeMetadata(array_merge(
            $this->extractWithRegex($pages),
            $this->assistant->extractMetadata($pages, 'mark_scheme'),
        ));
    }

    public function mergeMetadata(array $paperMeta, array $schemeMeta): array
    {
        $metadata = [
            'board' => $paperMeta['board'] ?? $schemeMeta['board'] ?? null,
            'level' => $paperMeta['level'] ?? $schemeMeta['level'] ?? null,
            'subjectName' => $paperMeta['subjectName'] ?? $schemeMeta['subjectName'] ?? null,
            'subjectCode' => $paperMeta['subjectCode'] ?? $schemeMeta['subjectCode'] ?? null,
            'paperCode' => $paperMeta['paperCode'] ?? $schemeMeta['paperCode'] ?? null,
            'session' => $paperMeta['session'] ?? $schemeMeta['session'] ?? null,
            'year' => $paperMeta['year'] ?? $schemeMeta['year'] ?? null,
            'totalMarks' => $paperMeta['totalMarks'] ?? $schemeMeta['totalMarks'] ?? null,
            'durationMinutes' => $paperMeta['durationMinutes'] ?? $schemeMeta['durationMinutes'] ?? null,
            'title' => $paperMeta['title'] ?? $schemeMeta['title'] ?? null,
        ];

        return $this->normalizeMetadata($metadata);
    }

    private function extractWithRegex(array $pages): array
    {
        $text = collect($pages)->pluck('text')->implode("\n");
        $firstLines = collect($pages)->take(2)->pluck('text')->implode("\n");

        preg_match('/\b(20\d{2}|19\d{2})\b/', $text, $yearMatch);
        preg_match('/\b(May\/?June|Oct\/?Nov|November|June|March|January)\b/i', $text, $sessionMatch);
        preg_match('/\b(?:Duration|Time)\s*[:\-]?\s*(\d{1,3})\s*(minutes?|mins?)\b/i', $text, $durationMatch);
        preg_match('/\[(\d{1,3})\s*marks?\]/i', $text, $marksMatch);
        preg_match('/\b(\d{4})\/(\d{2})\b/', $text, $subjectCodeMatch);
        preg_match('/\b([A-Z]{1,4}\d{2,4})\b/', $text, $paperCodeMatch);
        preg_match('/\b(Cambridge|Edexcel|AQA|OCR|IB)\b/i', $text, $boardMatch);
        preg_match('/\b(IGCSE|GCSE|A Level|AS Level|IB Diploma)\b/i', $text, $levelMatch);
        preg_match('/\b(Biology|Chemistry|Physics|Mathematics|Maths|English|History|Geography|Computer Science)\b/i', $text, $subjectNameMatch);

        $title = collect(preg_split('/\n+/', $firstLines) ?: [])->map(fn ($line) => trim((string) $line))->filter()->first();

        return [
            'board' => $boardMatch[1] ?? null,
            'level' => $levelMatch[1] ?? null,
            'subjectName' => $subjectNameMatch[1] ?? null,
            'subjectCode' => $subjectCodeMatch[0] ?? null,
            'paperCode' => $paperCodeMatch[1] ?? null,
            'session' => $sessionMatch[1] ?? null,
            'year' => isset($yearMatch[1]) ? (int) $yearMatch[1] : null,
            'totalMarks' => isset($marksMatch[1]) ? (int) $marksMatch[1] : null,
            'durationMinutes' => isset($durationMatch[1]) ? (int) $durationMatch[1] : null,
            'title' => $title,
        ];
    }

    private function normalizeMetadata(array $metadata): array
    {
        return array_filter([
            'board' => isset($metadata['board']) ? Str::title(trim((string) $metadata['board'])) : null,
            'level' => isset($metadata['level']) ? trim((string) $metadata['level']) : null,
            'subjectName' => isset($metadata['subjectName']) ? trim((string) $metadata['subjectName']) : null,
            'subjectCode' => isset($metadata['subjectCode']) ? Str::upper(trim((string) $metadata['subjectCode'])) : null,
            'paperCode' => isset($metadata['paperCode']) ? Str::upper(trim((string) $metadata['paperCode'])) : null,
            'session' => isset($metadata['session']) ? trim((string) $metadata['session']) : null,
            'year' => isset($metadata['year']) ? (int) $metadata['year'] : null,
            'totalMarks' => isset($metadata['totalMarks']) ? (int) $metadata['totalMarks'] : null,
            'durationMinutes' => isset($metadata['durationMinutes']) ? (int) $metadata['durationMinutes'] : null,
            'title' => isset($metadata['title']) ? trim((string) $metadata['title']) : null,
        ], fn ($value) => $value !== null && $value !== '');
    }
}
