<?php

namespace Database\Factories;

use App\Models\PaperQuestion;
use App\Models\QuestionRubric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuestionRubric>
 */
class QuestionRubricFactory extends Factory
{
    protected $model = QuestionRubric::class;

    public function definition(): array
    {
        return [
            'paper_question_id' => PaperQuestion::factory(),
            'band_descriptor' => fake()->optional()->paragraph(),
            'keywords_expected' => fake()->optional()->randomElements(['energy', 'chlorophyll', 'osmosis', 'reliability'], fake()->numberBetween(1, 3)),
            'common_mistakes' => fake()->optional()->randomElements(['missing definition', 'incorrect unit', 'partial reasoning'], fake()->numberBetween(1, 2)),
            'acceptable_alternatives' => fake()->optional()->randomElements(['CO2', 'carbon dioxide'], fake()->numberBetween(1, 2)),
            'marker_notes' => fake()->optional()->paragraph(),
        ];
    }
}
