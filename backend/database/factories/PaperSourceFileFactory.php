<?php

namespace Database\Factories;

use App\Enums\PaperSourceFileRole;
use App\Models\DocumentImport;
use App\Models\Paper;
use App\Models\PaperSourceFile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaperSourceFile>
 */
class PaperSourceFileFactory extends Factory
{
    protected $model = PaperSourceFile::class;

    public function definition(): array
    {
        return [
            'paper_id' => Paper::factory(),
            'document_import_id' => DocumentImport::factory(),
            'created_by' => User::factory()->admin(),
            'file_role' => fake()->randomElement(PaperSourceFileRole::cases()),
            'disk' => 'local',
            'path' => 'papers/source-files/'.fake()->uuid().'.pdf',
            'original_name' => fake()->slug().'.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => fake()->numberBetween(10_000, 5_000_000),
            'checksum' => fake()->sha1(),
            'metadata' => ['page_count' => fake()->numberBetween(1, 20)],
        ];
    }
}
