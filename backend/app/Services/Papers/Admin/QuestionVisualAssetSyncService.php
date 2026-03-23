<?php

namespace App\Services\Papers\Admin;

use App\Models\PaperQuestion;
use Illuminate\Support\Arr;

class QuestionVisualAssetSyncService
{
    public function sync(PaperQuestion $question, array $visualAssets): void
    {
        $existingAssets = $question->visualAssets()->get()->keyBy('id');

        foreach ($visualAssets as $index => $assetPayload) {
            $assetId = Arr::get($assetPayload, 'id');

            if (! $assetId || ! $existingAssets->has($assetId)) {
                continue;
            }

            $asset = $existingAssets->get($assetId);

            if ((bool) Arr::get($assetPayload, 'is_deleted', false)) {
                $asset->delete();
                continue;
            }

            $asset->update([
                'alt_text' => Arr::get($assetPayload, 'alt_text'),
                'caption' => Arr::get($assetPayload, 'caption'),
                'sort_order' => (int) Arr::get($assetPayload, 'sort_order', $index + 1),
            ]);
        }

        $question->update(['has_visual' => $question->visualAssets()->exists()]);
    }
}
