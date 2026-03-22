<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\DocumentImport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminImportApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_review_update_and_approve_import(): void
    {
        Storage::fake('local');
        $this->seed();

        $admin = User::query()->where('role', UserRole::Admin)->firstOrFail();
        Sanctum::actingAs($admin);

        $createResponse = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', [
            'question_paper' => UploadedFile::fake()->create('biology-paper.pdf', 100),
            'mark_scheme' => UploadedFile::fake()->create('biology-mark-scheme.pdf', 100),
        ]);

        $createResponse->assertCreated()->assertJsonPath('data.status', 'needs_review');

        $import = DocumentImport::query()->firstOrFail();
        $ambiguousItem = $import->items()->where('match_status', 'ambiguous')->firstOrFail();

        $updateResponse = $this->putJson("/api/admin/import-items/{$ambiguousItem->id}", [
            'question_key' => $ambiguousItem->question_key,
            'question_text' => $ambiguousItem->question_text,
            'reference_answer' => $ambiguousItem->reference_answer,
            'marking_guidelines' => $ambiguousItem->marking_guidelines,
            'resolved_max_marks' => 2,
            'match_status' => 'resolved',
            'admin_notes' => 'Resolved during admin review.',
            'is_approved' => true,
        ]);

        $updateResponse->assertOk()->assertJsonPath('data.matchStatus', 'resolved');

        $approveResponse = $this->postJson("/api/admin/imports/{$import->id}/approve");
        $approveResponse->assertOk()->assertJsonStructure(['message', 'data' => ['paperId', 'paperTitle']]);

        $this->assertDatabaseHas('papers', ['id' => $approveResponse->json('data.paperId')]);
    }
}
