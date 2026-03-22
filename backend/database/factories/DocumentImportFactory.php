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
            'status' => DocumentImportStatus::Uploaded,
            'question_paper_path' => 'imports/question-papers/'.fake()->uuid().'.pdf',
            'question_paper_name' => fake()->slug().'-question-paper.pdf',
            'mark_scheme_path' => 'imports/mark-schemes/'.fake()->uuid().'.pdf',
            'mark_scheme_name' => fake()->slug().'-mark-scheme.pdf',
            'metadata' => null,
            'summary' => null,
            'raw_extraction_payload' => null,
            'review_notes' => null,
            'error_message' => null,
            'approved_paper_id' => null,
            'processed_at' => null,
        ];
    }
}
