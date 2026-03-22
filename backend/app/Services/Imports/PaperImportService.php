<?php

namespace App\Services\Imports;

use App\Enums\DocumentImportStatus;
use App\Enums\PaperSourceFileRole;
use App\Jobs\ProcessPaperImportJob;
use App\Models\DocumentImport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PaperImportService
{
    public function createImportFromUpload(array $files, User $admin): DocumentImport
    {
        /** @var UploadedFile $questionPaper */
        $questionPaper = $files['question_paper'];
        /** @var UploadedFile $markScheme */
        $markScheme = $files['mark_scheme'];
        $disk = config('paper_imports.disk', 'local');

        $import = DocumentImport::create([
            'created_by' => $admin->id,
            'status' => DocumentImportStatus::Uploaded,
            'question_paper_path' => $questionPaper->store('imports/question-papers', $disk),
            'question_paper_name' => $questionPaper->getClientOriginalName(),
            'mark_scheme_path' => $markScheme->store('imports/mark-schemes', $disk),
            'mark_scheme_name' => $markScheme->getClientOriginalName(),
        ]);

        $this->createSourceFileRecord($import, $admin, PaperSourceFileRole::QuestionPaper, $questionPaper, $import->question_paper_path, $disk);
        $this->createSourceFileRecord($import, $admin, PaperSourceFileRole::MarkScheme, $markScheme, $import->mark_scheme_path, $disk);

        return $import;
    }

    public function queueProcessing(DocumentImport $import): void
    {
        $import->update(['status' => DocumentImportStatus::Processing]);

        ProcessPaperImportJob::dispatchSync($import->fresh());
    }

    private function createSourceFileRecord(DocumentImport $import, User $admin, PaperSourceFileRole $role, UploadedFile $file, string $path, string $disk): void
    {
        $import->sourceFiles()->create([
            'created_by' => $admin->id,
            'file_role' => $role,
            'disk' => $disk,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => strtolower((string) $file->getClientOriginalExtension()) === 'pdf'
                ? 'application/pdf'
                : 'text/plain',
            'size_bytes' => $file->getSize(),
            'checksum' => md5((string) Storage::disk($disk)->get($path)),
            'metadata' => [
                'uploaded_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
