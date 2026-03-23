<?php

namespace Database\Factories;

use App\Enums\ImportMatchStatus;
use App\Enums\AnswerInteractionType;
use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
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
            'question_type' => fake()->randomElement(array_column(QuestionType::cases(), 'value')),
            'answer_interaction_type' => fake()->randomElement(array_column(AnswerInteractionType::cases(), 'value')),
            'interaction_config' => [],
            'stem_context' => fake()->optional()->sentence(),
            'question_text' => fake()->paragraph(),
            'reference_answer' => fake()->optional()->paragraph(),
            'marking_guidelines' => fake()->optional()->paragraph(),
            'sample_full_mark_answer' => fake()->optional()->paragraph(),
            'question_paper_marks' => fake()->optional()->numberBetween(1, 10),
            'mark_scheme_marks' => fake()->optional()->numberBetween(1, 10),
            'resolved_max_marks' => fake()->optional()->numberBetween(1, 10),
            'match_status' => fake()->randomElement(array_column(ImportMatchStatus::cases(), 'value')),
            'requires_visual_reference' => false,
            'visual_reference_type' => fake()->optional()->randomElement(array_column(VisualReferenceType::cases(), 'value')),
            'visual_reference_note' => fake()->optional()->sentence(),
            'has_visual' => false,
            'flags' => [
                'needs_review' => false,
                'has_visual' => false,
                'low_confidence_match' => false,
            ],
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
