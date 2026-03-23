<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Models\DocumentImport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class JsonPaperImportService
{
    public function __construct(
        private readonly JsonImportValidator $validator,
        private readonly JsonImportDraftBuilder $draftBuilder,
        private readonly ImportPreviewBuilder $previewBuilder,
    ) {}

    public function createDraft(array $payload, User $admin): DocumentImport
    {
        $jsonInput = $this->extractJsonPayload($payload);
        $validated = $this->validator->validate($jsonInput['contents']);
        $preview = $this->previewBuilder->build($validated);

        $import = DocumentImport::create([
            'created_by' => $admin->id,
            'status' => DocumentImportStatus::Uploaded,
            'input_method' => $jsonInput['input_method'],
            'question_paper_path' => '',
            'question_paper_name' => $jsonInput['display_name'],
            'mark_scheme_path' => '',
            'mark_scheme_name' => 'Canonical JSON import',
            'json_file_path' => $jsonInput['path'],
            'json_file_name' => $jsonInput['display_name'],
        ]);

        return $this->draftBuilder->build($import, $validated, $preview);
    }

    private function extractJsonPayload(array $payload): array
    {
        $disk = (string) config('paper_imports.disk', 'public');
        $rawJson = $payload['raw_json'] ?? null;
        $jsonFile = $payload['json_file'] ?? null;

        if ($jsonFile instanceof UploadedFile) {
            $path = $jsonFile->store('imports/json', $disk);

            return [
                'contents' => Storage::disk($disk)->get($path),
                'path' => $path,
                'display_name' => $jsonFile->getClientOriginalName(),
                'input_method' => 'json_file',
            ];
        }

        return [
            'contents' => (string) $rawJson,
            'path' => null,
            'display_name' => 'Pasted JSON payload',
            'input_method' => 'raw_json',
        ];
    }
}
