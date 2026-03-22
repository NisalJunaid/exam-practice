<?php

namespace App\Services\Imports\Contracts;

interface PdfPageExtractor
{
    /**
     * @return array<int, array{page_number:int,text:string,visual_markers:array<int, string>}>
     */
    public function extract(string $disk, string $path): array;
}
