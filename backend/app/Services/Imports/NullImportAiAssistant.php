<?php

namespace App\Services\Imports;

use App\Services\Imports\Contracts\ImportAiAssistant;

class NullImportAiAssistant implements ImportAiAssistant
{
    public function extractMetadata(array $pages, string $documentType): array
    {
        return [];
    }
}
