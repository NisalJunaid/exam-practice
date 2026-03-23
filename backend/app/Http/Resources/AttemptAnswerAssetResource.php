<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttemptAnswerAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'attemptAnswerId' => $this->attempt_answer_id,
            'assetType' => $this->asset_type,
            'disk' => $this->disk,
            'filePath' => $this->file_path,
            'originalName' => $this->original_name,
            'mimeType' => $this->mime_type,
            'metadata' => $this->metadata ?? [],
            'url' => $this->url,
            'createdAt' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
