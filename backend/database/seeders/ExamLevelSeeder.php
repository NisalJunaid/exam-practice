<?php

namespace Database\Seeders;

use App\Models\ExamLevel;
use Illuminate\Database\Seeder;

class ExamLevelSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['name' => 'IGCSE', 'slug' => 'igcse'],
            ['name' => 'GCSE', 'slug' => 'gcse'],
            ['name' => 'AS Level', 'slug' => 'as-level'],
            ['name' => 'A Level', 'slug' => 'a-level'],
        ])->each(fn (array $level) => ExamLevel::query()->updateOrCreate(['slug' => $level['slug']], $level));
    }
}
