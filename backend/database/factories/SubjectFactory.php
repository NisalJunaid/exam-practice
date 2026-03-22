<?php

namespace Database\Factories;

use App\Models\ExamBoard;
use App\Models\ExamLevel;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Subject>
 */
class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Biology', 'Chemistry', 'Physics', 'Mathematics']);

        return [
            'exam_board_id' => ExamBoard::factory(),
            'exam_level_id' => ExamLevel::factory(),
            'name' => $name,
            'slug' => Str::slug($name.'-'.fake()->unique()->numberBetween(1, 9999)),
            'code' => strtoupper(fake()->bothify('??##')),
        ];
    }
}
