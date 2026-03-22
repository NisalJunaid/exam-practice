<?php

namespace Database\Seeders;

use App\Models\ExamBoard;
use Illuminate\Database\Seeder;

class ExamBoardSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['name' => 'Cambridge', 'slug' => 'cambridge'],
            ['name' => 'Edexcel', 'slug' => 'edexcel'],
            ['name' => 'OxfordAQA', 'slug' => 'oxfordaqa'],
        ])->each(fn (array $board) => ExamBoard::query()->updateOrCreate(['slug' => $board['slug']], $board));
    }
}
