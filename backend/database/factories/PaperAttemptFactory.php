<?php

namespace Database\Factories;

use App\Enums\PaperAttemptStatus;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaperAttempt>
 */
class PaperAttemptFactory extends Factory
{
    protected $model = PaperAttempt::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'paper_id' => Paper::factory(),
            'status' => PaperAttemptStatus::InProgress,
            'started_at' => now(),
            'submitted_at' => null,
            'completed_at' => null,
            'total_awarded_marks' => null,
            'total_max_marks' => fake()->numberBetween(20, 100),
            'marking_summary' => null,
        ];
    }
}
