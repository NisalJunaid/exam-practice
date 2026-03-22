<?php

namespace App\Services\Imports;

use App\Services\Imports\Contracts\PdfPageExtractor;

class PdfTextExtractionService
{
    public function __construct(private readonly PdfPageExtractor $extractor) {}

    /**
     * @return array<int, array{page_number:int,text:string,visual_markers:array<int,string>}>
     */
    public function extract(string $path, ?string $disk = null): array
    {
        return $this->extractor->extract($disk ?? config('paper_imports.disk', 'local'), $path);
    }
}
