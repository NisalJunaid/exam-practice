<?php

namespace Tests\Feature;

use App\Enums\ImportMatchStatus;
use App\Enums\UserRole;
use App\Models\DocumentImport;
use App\Models\Paper;
use App\Models\User;
use App\Services\Imports\Contracts\PdfPageExtractor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Fakes\ArrayPdfPageExtractor;
use Tests\TestCase;

class AdminImportApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('paper_imports.disk', 'local');
        Storage::fake('local');
        $this->seed();

        $admin = User::query()->where('role', UserRole::Admin)->firstOrFail();
        Sanctum::actingAs($admin);
    }

    public function test_admin_can_upload_import_and_store_source_files(): void
    {
        $this->fakeExtraction();

        $response = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', $this->uploadPayload());

        $response->assertCreated()
            ->assertJsonPath('data.status', 'needs_review')
            ->assertJsonPath('data.sourceFiles.0.role', 'question_paper')
            ->assertJsonPath('data.sourceFiles.1.role', 'mark_scheme');

        DocumentImport::query()->firstOrFail();

        $this->assertCount(1, Storage::disk('local')->allFiles('imports/question-papers'));
        $this->assertCount(1, Storage::disk('local')->allFiles('imports/mark-schemes'));
        $this->assertDatabaseCount('paper_source_files', 2);
    }

    public function test_processing_job_creates_draft_items_for_review_only(): void
    {
        $this->fakeExtraction();

        $response = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', $this->uploadPayload());
        $importId = $response->json('data.id');

        $this->assertDatabaseHas('document_imports', [
            'id' => $importId,
            'status' => 'needs_review',
        ]);
        $this->assertDatabaseHas('document_import_items', [
            'document_import_id' => $importId,
            'question_key' => '1(a)',
            'match_status' => 'matched',
            'question_page_number' => 1,
            'mark_scheme_page_number' => 1,
        ]);
        $this->assertDatabaseHas('document_import_items', [
            'document_import_id' => $importId,
            'question_key' => '2(a)',
            'match_status' => 'paper_only',
            'is_approved' => false,
        ]);
        $this->assertDatabaseMissing('papers', ['title' => 'Cambridge IGCSE Biology 0610/42']);
    }

    public function test_admin_can_fetch_review_summary_and_items(): void
    {
        $this->fakeExtraction();
        $importId = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', $this->uploadPayload())->json('data.id');

        $showResponse = $this->getJson("/api/admin/imports/{$importId}");
        $itemsResponse = $this->getJson("/api/admin/imports/{$importId}/items");

        $showResponse->assertOk()
            ->assertJsonPath('data.metadata.subjectName', 'Biology')
            ->assertJsonPath('data.summary.matchedItems', 2)
            ->assertJsonPath('data.summary.paperOnlyItems', 1)
            ->assertJsonPath('data.summary.totalItems', 3);

        $itemsResponse->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.questionKey', '1(a)')
            ->assertJsonPath('data.0.rawQuestionPayload.question_key', '1(a)')
            ->assertJsonPath('data.0.rawMarkSchemePayload.question_key', '1(a)');
    }

    public function test_admin_can_update_import_item_during_review(): void
    {
        $this->fakeExtraction();
        $importId = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', $this->uploadPayload())->json('data.id');
        $import = DocumentImport::query()->findOrFail($importId);
        $item = $import->items()->where('question_key', '2(a)')->firstOrFail();

        $response = $this->putJson("/api/admin/import-items/{$item->id}", [
            'question_key' => '2(a)',
            'question_number' => '2',
            'parent_key' => null,
            'stem_context' => 'Study the enzyme experiment.',
            'question_text' => 'Describe one limitation in the experiment.',
            'reference_answer' => 'Only one temperature was tested.',
            'marking_guidelines' => 'Accept limited range or uncontrolled variables.',
            'resolved_max_marks' => 2,
            'match_status' => ImportMatchStatus::Resolved->value,
            'admin_notes' => 'Resolved manually during review.',
            'is_approved' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.matchStatus', 'resolved')
            ->assertJsonPath('data.isApproved', true)
            ->assertJsonPath('data.referenceAnswer', 'Only one temperature was tested.');

        $this->assertDatabaseHas('document_import_items', [
            'id' => $item->id,
            'match_status' => 'resolved',
            'is_approved' => true,
        ]);
    }

    public function test_admin_can_approve_reviewed_import_into_final_paper_records_without_publishing(): void
    {
        $this->fakeExtraction();
        $importId = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', $this->uploadPayload())->json('data.id');
        $import = DocumentImport::query()->findOrFail($importId);
        $item = $import->items()->where('question_key', '2(a)')->firstOrFail();

        $this->putJson("/api/admin/import-items/{$item->id}", [
            'question_key' => '2(a)',
            'question_number' => '2',
            'question_text' => 'Describe one limitation in the experiment.',
            'reference_answer' => 'Only one temperature was tested.',
            'marking_guidelines' => 'Accept limited range or uncontrolled variables.',
            'resolved_max_marks' => 2,
            'match_status' => ImportMatchStatus::Resolved->value,
            'admin_notes' => 'Resolved manually during review.',
            'is_approved' => true,
        ])->assertOk();

        $approveResponse = $this->postJson("/api/admin/imports/{$importId}/approve");

        $approveResponse->assertOk()
            ->assertJsonPath('data.isPublished', false);

        $paper = Paper::query()->findOrFail($approveResponse->json('data.paperId'));

        $this->assertSame(3, $paper->questions()->count());
        $this->assertFalse($paper->is_published);
        $this->assertDatabaseHas('document_imports', [
            'id' => $importId,
            'status' => 'approved',
            'approved_paper_id' => $paper->id,
        ]);
        $this->assertDatabaseHas('paper_questions', [
            'paper_id' => $paper->id,
            'question_key' => '1(a)',
            'max_marks' => 2,
        ]);
        $this->assertDatabaseHas('paper_questions', [
            'paper_id' => $paper->id,
            'question_key' => '2(a)',
            'max_marks' => 2,
        ]);
        $this->assertDatabaseHas('question_rubrics', [
            'paper_question_id' => $paper->questions()->where('question_key', '2(a)')->firstOrFail()->id,
        ]);
        $this->assertDatabaseHas('paper_source_files', [
            'document_import_id' => $importId,
            'paper_id' => $paper->id,
            'file_role' => 'question_paper',
        ]);
        $this->assertDatabaseHas('paper_source_files', [
            'document_import_id' => $importId,
            'paper_id' => $paper->id,
            'file_role' => 'mark_scheme',
        ]);
    }

    public function test_admin_cannot_approve_import_until_all_review_only_rows_are_resolved(): void
    {
        $this->fakeExtraction();
        $existingPaperCount = Paper::query()->count();
        $importId = $this->withHeader('Accept', 'application/json')->post('/api/admin/imports', $this->uploadPayload())->json('data.id');

        $this->postJson("/api/admin/imports/{$importId}/approve")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Resolve all ambiguous or unmatched import items before approval.');

        $this->assertDatabaseHas('document_imports', [
            'id' => $importId,
            'status' => 'needs_review',
            'approved_paper_id' => null,
        ]);
        $this->assertSame($existingPaperCount, Paper::query()->count());
    }

    private function fakeExtraction(): void
    {
        $this->app->instance(PdfPageExtractor::class, new ArrayPdfPageExtractor([
            [
                [
                    'page_number' => 1,
                    'text' => <<<'TEXT'
Cambridge IGCSE Biology 0610/42
May/June 2024
Duration: 75 minutes
1 Photosynthesis and leaves
(a) State two observable features of a healthy leaf. [2]
(b) Explain why chlorophyll is important for photosynthesis. [1]
2 Enzyme investigation
(a) Describe one limitation in the experiment. [2]
TEXT,
                ],
            ],
            [
                [
                    'page_number' => 1,
                    'text' => <<<'TEXT'
General marking principles
1(a) green leaf; broad surface area [2]
1(b) absorbs light energy for photosynthesis [1]
TEXT,
                ],
            ],
        ]));
    }

    private function uploadPayload(): array
    {
        return [
            'question_paper' => UploadedFile::fake()->createWithContent('biology-paper.pdf', 'fake question paper binary'),
            'mark_scheme' => UploadedFile::fake()->createWithContent('biology-mark-scheme.pdf', 'fake mark scheme binary'),
        ];
    }
}
