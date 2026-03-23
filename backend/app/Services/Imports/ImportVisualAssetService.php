<?php

namespace App\Services\Imports;

use App\Enums\QuestionVisualAssetRole;
use App\Models\DocumentImportItem;
use App\Models\PaperQuestion;
use App\Models\QuestionVisualAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImportVisualAssetService
{
    public function attachToDraftItem(DocumentImportItem $item, array $files, ?string $assetRole = null): array
    {
        $disk = (string) config('paper_imports.disk', 'public');
        $startingOrder = (int) $item->visualAssets()->max('sort_order');
        $created = [];

        foreach (array_values($files) as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store('imports/question-visuals', $disk);
            $created[] = $item->visualAssets()->create([
                'asset_role' => $assetRole ?? $this->mapRoleFromItem($item),
                'disk' => $disk,
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'alt_text' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'caption' => null,
                'mime_type' => $file->getMimeType(),
                'sort_order' => $startingOrder + $index + 1,
            ]);
        }

        $item = $item->fresh('visualAssets');
        $item->forceFill([
            'has_visual' => $item->visualAssets->isNotEmpty(),
            'match_status' => $this->determineDraftStatus($item),
        ])->save();

        return $created;
    }

    public function deleteDraftAsset(QuestionVisualAsset $asset): void
    {
        if (filled($asset->file_path)) {
            Storage::disk($asset->disk)->delete($asset->file_path);
        }

        $item = $asset->importItem;
        $asset->delete();

        if ($item) {
            $item = $item->fresh('visualAssets');
            $item->forceFill([
                'has_visual' => $item->visualAssets->isNotEmpty(),
                'match_status' => $this->determineDraftStatus($item),
            ])->save();
        }
    }

    public function cloneToPaperQuestion(DocumentImportItem $item, PaperQuestion $question): void
    {
        $item->loadMissing('visualAssets');

        foreach ($item->visualAssets as $asset) {
            QuestionVisualAsset::create([
                'paper_question_id' => $question->id,
                'document_import_item_id' => $item->id,
                'asset_role' => $asset->asset_role,
                'disk' => $asset->disk,
                'file_path' => $asset->file_path,
                'original_name' => $asset->original_name,
                'alt_text' => $asset->alt_text,
                'caption' => $asset->caption,
                'mime_type' => $asset->mime_type,
                'sort_order' => $asset->sort_order,
            ]);
        }
    }

    private function mapRoleFromItem(DocumentImportItem $item): string
    {
        return match ($item->visual_reference_type?->value) {
            'diagram' => QuestionVisualAssetRole::Diagram->value,
            'table' => QuestionVisualAssetRole::Table->value,
            'graph' => QuestionVisualAssetRole::Graph->value,
            'chemical_structure' => QuestionVisualAssetRole::Structure->value,
            default => QuestionVisualAssetRole::Reference->value,
        };
    }

    private function determineDraftStatus(DocumentImportItem $item): string
    {
        $flags = $item->flags ?? [];
        $hasDraftVisuals = $item->visualAssets->isNotEmpty();

        if ($item->requires_visual_reference && ! $hasDraftVisuals) {
            return 'missing_visual';
        }

        if (($flags['needs_review'] ?? false) || ($flags['low_confidence_match'] ?? false)) {
            return 'warning';
        }

        return 'ready';
    }
}
