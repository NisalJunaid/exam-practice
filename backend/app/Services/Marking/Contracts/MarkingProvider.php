<?php

namespace App\Services\Marking\Contracts;

interface MarkingProvider
{
    public function providerName(): string;

    public function modelName(): string;

    /**
     * @return array{request_payload: array<string, mixed>, response_payload: array<string, mixed>|null, content: string|null}
     */
    public function generateMarking(array $prompt): array;
}
