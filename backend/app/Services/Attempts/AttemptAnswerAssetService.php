<?php

namespace App\Services\Attempts;

use App\Models\AttemptAnswerAsset;
use App\Models\PaperAttempt;
use Illuminate\Http\UploadedFile;
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

        return $answer->assets()->create([
            'asset_type' => $assetType,
            'disk' => 'public',
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'metadata' => $metadata,
        ]);
    }
}
