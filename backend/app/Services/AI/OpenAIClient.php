<?php

namespace App\Services\AI;

use App\Services\Marking\Contracts\MarkingProvider;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use RuntimeException;

class OpenAIClient implements MarkingProvider
{
    public function __construct(
        private readonly ClientInterface $http,
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly int $timeoutSeconds,
    ) {}

    public function providerName(): string
    {
        return 'openai';
    }

    public function modelName(): string
    {
        return $this->model;
    }

    public function generateMarking(array $prompt): array
    {
        if ($this->apiKey === '') {
            throw new RuntimeException('AI marking provider is configured for OpenAI, but no API key is set.');
        }

        $payload = [
            'model' => $this->model,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $prompt['system'],
                ],
                [
                    'role' => 'user',
                    'content' => $prompt['user'],
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
            throw new RuntimeException('OpenAI marking request failed: '.$exception->getMessage(), previous: $exception);
        }

        $body = (string) $response->getBody();
        $decoded = json_decode($body, true);
        $content = data_get($decoded, 'choices.0.message.content');

        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('OpenAI marking response did not include message content.');
        }

        return [
            'request_payload' => $payload,
            'response_payload' => is_array($decoded) ? $decoded : ['raw' => $body],
            'content' => $content,
        ];
    }
}
