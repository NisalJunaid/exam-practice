<?php

namespace Database\Factories;

use App\Enums\ImportMatchStatus;
use App\Models\DocumentImport;
use App\Models\DocumentImportItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentImportItem>
 */
class DocumentImportItemFactory extends Factory
{
    protected $model = DocumentImportItem::class;

    public function definition(): array
    {
        return [
            'document_import_id' => DocumentImport::factory(),
            'question_key' => fake()->regexify('[1-9]\([a-d]\)'),
            'parent_key' => null,
            'question_number' => (string) fake()->numberBetween(1, 12),
            'stem_context' => fake()->optional()->sentence(),
            'question_text' => fake()->paragraph(),
            'reference_answer' => fake()->optional()->paragraph(),
            'marking_guidelines' => fake()->optional()->paragraph(),
            'question_paper_marks' => fake()->optional()->numberBetween(1, 10),
            'mark_scheme_marks' => fake()->optional()->numberBetween(1, 10),
            'resolved_max_marks' => fake()->optional()->numberBetween(1, 10),
            'match_status' => fake()->randomElement(ImportMatchStatus::cases()),
            'page_number' => fake()->optional()->numberBetween(1, 20),
            'question_page_number' => fake()->optional()->numberBetween(1, 20),
            'mark_scheme_page_number' => fake()->optional()->numberBetween(1, 20),
            'order_index' => fake()->numberBetween(1, 20),
            'is_approved' => false,
            'admin_notes' => null,
            'raw_payload' => null,
            'raw_question_payload' => null,
            'raw_mark_scheme_payload' => null,
        ];
    }
}
