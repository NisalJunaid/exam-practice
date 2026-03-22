<?php

namespace Database\Factories;

use App\Models\Paper;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Paper>
 */
class PaperFactory extends Factory
{
    protected $model = Paper::class;

    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'subject_id' => Subject::factory(),
            'title' => $title,
            'slug' => Str::slug($title.'-'.fake()->unique()->numberBetween(1, 9999)),
            'paper_code' => strtoupper(fake()->bothify('P?#')),
            'year' => fake()->numberBetween(2018, 2026),
            'session' => fake()->randomElement(['May/June', 'October/November']),
            'duration_minutes' => fake()->numberBetween(45, 180),
            'total_marks' => fake()->numberBetween(30, 120),
            'instructions' => fake()->paragraph(),
            'is_published' => false,
        ];
    }
}
