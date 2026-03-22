<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ExamBoardSeeder::class,
            ExamLevelSeeder::class,
            AdminUserSeeder::class,
            StudentUserSeeder::class,
            SubjectSeeder::class,
            DemoPaperSeeder::class,
        ]);
    }
}
