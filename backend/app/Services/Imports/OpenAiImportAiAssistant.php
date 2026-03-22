<?php

namespace App\Services\Imports;

use App\Services\Imports\Contracts\ImportAiAssistant;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use RuntimeException;

class OpenAiImportAiAssistant implements ImportAiAssistant
{
    public function __construct(
        private readonly ClientInterface $http,
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly int $timeoutSeconds,
    ) {}

    public function extractMetadata(array $pages, string $documentType): array
    {
        if ($this->apiKey === '' || $pages === []) {
            return [];
        }

        $excerpt = collect($pages)
            ->take(2)
            ->map(fn (array $page): string => "Page {$page['page_number']}:\n".mb_substr((string) $page['text'], 0, 2500))
            ->implode("\n\n");

        $payload = [
            'model' => $this->model,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Extract exam paper metadata as JSON with keys board, level, subjectName, subjectCode, paperCode, session, year, totalMarks, durationMinutes, title. Return only confident values.',
                ],
                [
                    'role' => 'user',
                    'content' => "Document type: {$documentType}\n\n{$excerpt}",
                ],
            ],
        ];

        try {
            $response = $this->http->request('POST', rtrim($this->baseUrl, '/').'/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer '.$this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
                'timeout' => $this->timeoutSeconds,
            ]);
        } catch (GuzzleException $exception) {
            throw new RuntimeException('OpenAI import metadata request failed: '.$exception->getMessage(), previous: $exception);
        }

        $decoded = json_decode((string) $response->getBody(), true);
        $content = data_get($decoded, 'choices.0.message.content');

        if (! is_string($content) || trim($content) === '') {
            return [];
        }

        $parsed = json_decode($content, true);

        return is_array($parsed) ? $parsed : [];
    }
}
