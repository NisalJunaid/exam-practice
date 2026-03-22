<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentImportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status?->value,
            'questionPaperName' => $this->question_paper_name,
            'markSchemeName' => $this->mark_scheme_name,
            'metadata' => $this->metadata ?? [],
            'summary' => $this->summary ?? [],
            'reviewNotes' => $this->review_notes,
            'errorMessage' => $this->error_message,
            'processedAt' => optional($this->processed_at)->toIso8601String(),
            'approvedPaperId' => $this->approved_paper_id,
            'rawExtractionPayload' => $this->raw_extraction_payload ?? [],
            'sourceFiles' => $this->whenLoaded('sourceFiles', fn () => $this->sourceFiles->map(fn ($file) => [
                'id' => $file->id,
                'role' => $file->file_role?->value,
                'disk' => $file->disk,
                'path' => $file->path,
                'originalName' => $file->original_name,
                'mimeType' => $file->mime_type,
                'sizeBytes' => $file->size_bytes,
                'paperId' => $file->paper_id,
            ])),
            'items' => DocumentImportItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
