<?php

namespace Database\Factories;

use App\Enums\AnswerInteractionType;
use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
use App\Models\Paper;
use App\Models\PaperQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaperQuestion>
 */
class PaperQuestionFactory extends Factory
{
    protected $model = PaperQuestion::class;

    public function definition(): array
    {
        return [
            'paper_id' => Paper::factory(),
            'question_number' => (string) fake()->numberBetween(1, 12),
            'question_key' => fake()->optional()->regexify('[1-9]\([a-d]\)'),
            'question_type' => fake()->randomElement(array_column(QuestionType::cases(), 'value')),
            'answer_interaction_type' => fake()->randomElement(array_column(AnswerInteractionType::cases(), 'value')),
            'interaction_config' => [],
            'question_text' => fake()->paragraphs(2, true),
            'reference_answer' => fake()->paragraph(),
            'max_marks' => fake()->numberBetween(1, 10),
            'marking_guidelines' => fake()->optional()->paragraph(),
            'sample_full_mark_answer' => fake()->optional()->paragraph(),
            'order_index' => fake()->numberBetween(1, 20),
            'stem_context' => fake()->optional()->sentence(),
            'requires_visual_reference' => false,
            'visual_reference_type' => fake()->optional()->randomElement(array_column(VisualReferenceType::cases(), 'value')),
            'visual_reference_note' => fake()->optional()->sentence(),
            'has_visual' => false,
        ];
    }
}
