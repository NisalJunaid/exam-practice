<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionVisualAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assetRole' => $this->asset_role?->value ?? $this->asset_role,
            'disk' => $this->disk,
            'filePath' => $this->file_path,
            'originalName' => $this->original_name,
            'altText' => $this->alt_text,
            'caption' => $this->caption,
            'mimeType' => $this->mime_type,
            'sortOrder' => $this->sort_order,
            'url' => $this->url,
        ];
    }
}
