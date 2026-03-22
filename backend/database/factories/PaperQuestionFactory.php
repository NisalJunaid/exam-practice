<?php

namespace Database\Factories;

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
            'question_text' => fake()->paragraphs(2, true),
            'reference_answer' => fake()->paragraph(),
            'max_marks' => fake()->numberBetween(1, 10),
            'marking_guidelines' => fake()->optional()->paragraph(),
            'sample_full_mark_answer' => fake()->optional()->paragraph(),
            'order_index' => fake()->numberBetween(1, 20),
            'stem_context' => fake()->optional()->sentence(),
        ];
    }
}
