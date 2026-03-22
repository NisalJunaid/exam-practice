<?php

namespace Database\Factories;

use App\Models\ExamBoard;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ExamBoard>
 */
class ExamBoardFactory extends Factory
{
    protected $model = ExamBoard::class;

    public function definition(): array
    {
        $name = fake()->unique()->company().' Board';

        return [
            'name' => $name,
            'slug' => Str::slug($name),
        ];
    }
}
