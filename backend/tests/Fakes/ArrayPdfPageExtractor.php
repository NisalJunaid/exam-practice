<?php

namespace Tests\Fakes;

use App\Services\Imports\Contracts\PdfPageExtractor;
use RuntimeException;

class ArrayPdfPageExtractor implements PdfPageExtractor
{
    /**
     * @param  array<int, array<int, array{page_number:int,text:string,visual_markers?:array<int,string>}>>  $queuedPages
     */
    public function __construct(private array $queuedPages) {}

    public function extract(string $disk, string $path): array
    {
        $pages = array_shift($this->queuedPages);

        if ($pages === null) {
            throw new RuntimeException('No fake extraction pages remain for '.$path);
        }

        return array_map(fn (array $page): array => [
            'page_number' => (int) $page['page_number'],
            'text' => (string) $page['text'],
            'visual_markers' => array_values($page['visual_markers'] ?? []),
        ], $pages);
    }
}
