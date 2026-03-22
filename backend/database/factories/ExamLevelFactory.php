<?php

namespace Database\Factories;

use App\Models\ExamLevel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ExamLevel>
 */
class ExamLevelFactory extends Factory
{
    protected $model = ExamLevel::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['GCSE', 'IGCSE', 'AS Level', 'A Level']);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
        ];
    }
}
