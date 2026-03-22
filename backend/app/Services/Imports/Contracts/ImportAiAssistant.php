<?php

namespace App\Services\Imports\Contracts;

interface ImportAiAssistant
{
    /**
     * @return array<string, mixed>
     */
    public function extractMetadata(array $pages, string $documentType): array;
}
