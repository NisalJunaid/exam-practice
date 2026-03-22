<?php

namespace Database\Factories;

use App\Models\AttemptAnswer;
use App\Models\PaperAttempt;
use App\Models\PaperQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttemptAnswer>
 */
class AttemptAnswerFactory extends Factory
{
    protected $model = AttemptAnswer::class;

    public function definition(): array
    {
        return [
            'paper_attempt_id' => PaperAttempt::factory(),
            'paper_question_id' => PaperQuestion::factory(),
            'student_answer' => fake()->optional()->paragraph(),
            'is_blank' => false,
            'submitted_at' => null,
        ];
    }
}
