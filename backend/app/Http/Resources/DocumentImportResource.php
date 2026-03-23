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
            'inputMethod' => $this->input_method,
            'jsonFileName' => $this->json_file_name,
            'questionPaperName' => $this->question_paper_name,
            'markSchemeName' => $this->mark_scheme_name,
            'metadata' => $this->metadata ?? [],
            'summary' => $this->summary ?? [],
            'preview' => $this->preview_payload ?? [],
            'reviewNotes' => $this->review_notes,
            'errorMessage' => $this->error_message,
            'processedAt' => optional($this->processed_at)->toIso8601String(),
            'approvedPaperId' => $this->approved_paper_id,
            'rawJsonPayload' => $this->raw_json_payload ?? [],
            'items' => DocumentImportItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
