<?php

namespace App\Services\Attempts;

use App\Models\AttemptAnswerAsset;
use App\Models\PaperAttempt;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class AttemptAnswerAssetService
{
    public function upload(PaperAttempt $attempt, int $paperQuestionId, string $assetType, UploadedFile $file, array $metadata = []): AttemptAnswerAsset
    {
        $answer = $attempt->answers()->where('paper_question_id', $paperQuestionId)->first();

        if (! $answer) {
            throw new RuntimeException('That question does not belong to this attempt.');
        }

        $path = $file->store("attempt-answers/{$attempt->id}", 'public');

        $replaceExisting = (bool) ($metadata['replace_existing'] ?? true);

        if ($replaceExisting) {
            $answer->assets()
                ->where('asset_type', $assetType)
                ->get()
                ->each(function (AttemptAnswerAsset $asset): void {
                    if (filled($asset->file_path)) {
                        Storage::disk($asset->disk)->delete($asset->file_path);
                    }

                    $asset->delete();
                });
        }

        $asset = $answer->assets()->create([
            'asset_type' => $assetType,
            'disk' => 'public',
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'metadata' => array_merge($metadata, [
                'paper_question_id' => $paperQuestionId,
                'attempt_id' => $attempt->id,
            ]),
        ]);

        return $asset->fresh();
    }
}
