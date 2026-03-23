<?php

namespace Database\Factories;

use App\Enums\DocumentImportStatus;
use App\Models\DocumentImport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentImport>
 */
class DocumentImportFactory extends Factory
{
    protected $model = DocumentImport::class;

    public function definition(): array
    {
        return [
            'created_by' => User::factory()->admin(),
            'status' => DocumentImportStatus::NeedsReview,
            'input_method' => 'raw_json',
            'question_paper_path' => '',
            'question_paper_name' => 'Pasted JSON payload',
            'mark_scheme_path' => '',
            'mark_scheme_name' => 'Canonical JSON import',
            'json_file_path' => null,
            'json_file_name' => null,
            'metadata' => null,
            'summary' => null,
            'raw_json_payload' => null,
            'preview_payload' => null,
            'raw_extraction_payload' => null,
            'review_notes' => null,
            'error_message' => null,
            'approved_paper_id' => null,
            'processed_at' => null,
        ];
    }
}
