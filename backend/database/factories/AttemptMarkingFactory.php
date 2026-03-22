<?php

namespace Database\Factories;

use App\Models\AttemptAnswer;
use App\Models\AttemptMarking;
use App\Models\PaperAttempt;
use App\Models\PaperQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttemptMarking>
 */
class AttemptMarkingFactory extends Factory
{
    protected $model = AttemptMarking::class;

    public function definition(): array
    {
        return [
            'paper_attempt_id' => PaperAttempt::factory(),
            'attempt_answer_id' => AttemptAnswer::factory(),
            'paper_question_id' => PaperQuestion::factory(),
            'awarded_marks' => fake()->numberBetween(0, 5),
            'max_marks' => fake()->numberBetween(1, 10),
            'reasoning' => fake()->paragraph(),
            'feedback' => fake()->paragraph(),
            'strengths' => fake()->randomElements(['clear explanation', 'accurate terminology'], fake()->numberBetween(1, 2)),
            'mistakes' => fake()->randomElements(['missed final point', 'needs more evidence'], fake()->numberBetween(1, 2)),
            'ai_confidence' => fake()->randomFloat(2, 0.4, 0.99),
        ];
    }
}
