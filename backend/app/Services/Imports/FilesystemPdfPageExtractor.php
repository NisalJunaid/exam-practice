<?php

namespace App\Services\Imports;

use App\Services\Imports\Contracts\PdfPageExtractor;
use Illuminate\Support\Facades\Storage;

class FilesystemPdfPageExtractor implements PdfPageExtractor
{
    public function extract(string $disk, string $path): array
    {
        $contents = (string) Storage::disk($disk)->get($path);
        $normalized = preg_replace("/\r\n?|\r/", "\n", $contents) ?? '';
        $chunks = preg_split('/\n\s*---PAGE---\s*\n/i', $normalized) ?: [$normalized];
        $pages = [];

        foreach ($chunks as $index => $chunk) {
            $text = trim((string) $chunk);

            if ($text === '') {
                continue;
            }

            $pages[] = [
                'page_number' => $index + 1,
                'text' => $text,
                'visual_markers' => preg_match_all('/\[(diagram|table|graph|image|figure)\]/i', $text, $matches) > 0
                    ? array_values(array_unique(array_map('strtolower', $matches[1])))
                    : [],
            ];
        }

        if ($pages !== []) {
            return $pages;
        }

        return [[
            'page_number' => 1,
            'text' => '',
            'visual_markers' => [],
        ]];
    }
}
