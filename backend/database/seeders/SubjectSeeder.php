<?php

namespace Database\Seeders;

use App\Models\ExamBoard;
use App\Models\ExamLevel;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $cambridge = ExamBoard::query()->where('slug', 'cambridge')->firstOrFail();
        $edexcel = ExamBoard::query()->where('slug', 'edexcel')->firstOrFail();
        $igcse = ExamLevel::query()->where('slug', 'igcse')->firstOrFail();
        $aLevel = ExamLevel::query()->where('slug', 'a-level')->firstOrFail();

        collect([
            ['exam_board_id' => $cambridge->id, 'exam_level_id' => $igcse->id, 'name' => 'Biology', 'slug' => 'biology-0610', 'code' => '0610'],
            ['exam_board_id' => $cambridge->id, 'exam_level_id' => $igcse->id, 'name' => 'Chemistry', 'slug' => 'chemistry-0620', 'code' => '0620'],
            ['exam_board_id' => $cambridge->id, 'exam_level_id' => $igcse->id, 'name' => 'Physics', 'slug' => 'physics-0625', 'code' => '0625'],
            ['exam_board_id' => $edexcel->id, 'exam_level_id' => $aLevel->id, 'name' => 'Mathematics', 'slug' => 'mathematics-9ma0', 'code' => '9MA0'],
        ])->each(function (array $subject) {
            Subject::query()->updateOrCreate(
                [
                    'exam_board_id' => $subject['exam_board_id'],
                    'exam_level_id' => $subject['exam_level_id'],
                    'slug' => $subject['slug'],
                ],
                $subject,
            );
        });
    }
}
