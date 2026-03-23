<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\DocumentImport;
use App\Models\Paper;
use App\Models\QuestionVisualAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
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

    public function test_admin_can_create_a_valid_json_import_draft(): void
    {
        $response = $this->postJson('/api/admin/imports/json', [
            'raw_json' => json_encode($this->validPaperJson(), JSON_PRETTY_PRINT),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'needs_review')
            ->assertJsonPath('data.metadata.title', 'Cambridge IGCSE Biology 0610/42')
            ->assertJsonPath('data.items.1.questionType', 'diagram_label')
            ->assertJsonPath('data.items.1.answerInteractionType', 'diagram_annotation')
            ->assertJsonPath('data.items.2.answerInteractionType', 'table_input')
            ->assertJsonPath('data.items.1.reviewStatus', 'missing_visual');

        $this->assertDatabaseHas('document_imports', [
            'status' => 'needs_review',
            'input_method' => 'raw_json',
        ]);
        $this->assertDatabaseHas('document_import_items', [
            'question_key' => '2(a)',
            'question_type' => 'diagram_label',
            'answer_interaction_type' => 'diagram_annotation',
            'requires_visual_reference' => true,
            'visual_reference_type' => 'diagram',
        ]);
        $this->assertDatabaseMissing('papers', [
            'title' => 'Cambridge IGCSE Biology 0610/42',
        ]);
    }

    public function test_invalid_json_schema_is_rejected(): void
    {
        $payload = $this->validPaperJson();
        unset($payload['paper']['title']);
        $payload['questions'][1]['visual_reference_type'] = 'not_supported';

        $this->postJson('/api/admin/imports/json', [
            'raw_json' => json_encode($payload, JSON_PRETTY_PRINT),
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['paper.title']);
    }

    public function test_admin_can_update_import_item(): void
    {
        $importId = $this->createDraftImport();
        $import = DocumentImport::query()->findOrFail($importId);
        $item = $import->items()->where('question_key', '3(a)')->firstOrFail();

        $response = $this->putJson("/api/admin/import-items/{$item->id}", [
            'question_key' => '3(a)',
            'question_number' => '3',
            'parent_key' => null,
            'question_type' => 'multiple_part',
            'answer_interaction_type' => 'multi_field',
            'interaction_config' => ['fields' => [['key' => 'effect', 'label' => 'Effect', 'type' => 'text']]],
            'stem_context' => 'Updated structured context.',
            'question_text' => 'Explain the effect of temperature and justify your answer.',
            'reference_answer' => 'Temperature increases kinetic energy until enzymes denature.',
            'marking_guidelines' => 'Credit valid linked explanation points.',
            'sample_full_mark_answer' => 'Higher temperature increases collisions, but excess heat denatures enzymes.',
            'resolved_max_marks' => 5,
            'requires_visual_reference' => false,
            'visual_reference_type' => null,
            'visual_reference_note' => null,
            'flags' => [
                'needs_review' => false,
                'has_visual' => false,
                'low_confidence_match' => false,
            ],
            'question_page_number' => 5,
            'mark_scheme_page_number' => 9,
            'admin_notes' => 'Updated after review.',
            'is_approved' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.questionType', 'multiple_part')
            ->assertJsonPath('data.answerInteractionType', 'multi_field')
            ->assertJsonPath('data.resolvedMaxMarks', 5)
            ->assertJsonPath('data.reviewStatus', 'ready');

        $this->assertDatabaseHas('document_import_items', [
            'id' => $item->id,
            'question_type' => 'multiple_part',
            'answer_interaction_type' => 'multi_field',
            'resolved_max_marks' => 5,
            'is_approved' => true,
        ]);
    }

    public function test_admin_can_upload_visuals_for_import_item(): void
    {
        $importId = $this->createDraftImport();
        $item = DocumentImport::query()->findOrFail($importId)->items()->where('question_key', '2(a)')->firstOrFail();

        $response = $this->post("/api/admin/import-items/{$item->id}/visuals", [
            'files' => [
                UploadedFile::fake()->image('diagram-1.png'),
                UploadedFile::fake()->image('diagram-2.png'),
            ],
            'asset_role' => 'diagram',
        ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('item.visualCount', 2)
            ->assertJsonPath('item.reviewStatus', 'warning');

        $this->assertDatabaseCount('question_visual_assets', 2);
        $this->assertDatabaseHas('question_visual_assets', [
            'document_import_item_id' => $item->id,
            'asset_role' => 'diagram',
        ]);
    }

    public function test_admin_can_approve_import_with_visuals_and_create_final_records(): void
    {
        $importId = $this->createDraftImport();
        $import = DocumentImport::query()->findOrFail($importId);
        $visualItem = $import->items()->where('question_key', '2(a)')->firstOrFail();

        $this->post("/api/admin/import-items/{$visualItem->id}/visuals", [
            'files' => [UploadedFile::fake()->image('cell-diagram.png')],
            'asset_role' => 'diagram',
        ], ['Accept' => 'application/json'])->assertCreated();

        $approveResponse = $this->postJson("/api/admin/imports/{$importId}/approve");

        $approveResponse->assertOk()
            ->assertJsonPath('data.isPublished', false);

        $paper = Paper::query()->findOrFail($approveResponse->json('data.paperId'));
        $visualQuestion = $paper->questions()->where('question_key', '2(a)')->firstOrFail();

        $this->assertSame(4, $paper->questions()->count());
        $this->assertFalse($paper->is_published);
        $this->assertDatabaseHas('papers', [
            'id' => $paper->id,
            'title' => 'Cambridge IGCSE Biology 0610/42',
            'is_published' => false,
        ]);
        $this->assertDatabaseHas('paper_questions', [
            'paper_id' => $paper->id,
            'question_key' => '2(a)',
            'question_type' => 'diagram_label',
            'answer_interaction_type' => 'diagram_annotation',
            'requires_visual_reference' => true,
            'has_visual' => true,
        ]);
        $this->assertDatabaseHas('question_visual_assets', [
            'paper_question_id' => $visualQuestion->id,
            'document_import_item_id' => $visualItem->id,
            'asset_role' => 'diagram',
            'alt_text' => 'cell-diagram',
        ]);
        $this->assertDatabaseHas('question_rubrics', [
            'paper_question_id' => $visualQuestion->id,
        ]);
    }

    public function test_approve_requires_visuals_unless_override_is_explicit(): void
    {
        $importId = $this->createDraftImport();

        $this->postJson("/api/admin/imports/{$importId}/approve")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Upload visuals for all image-dependent questions or approve with an explicit override.');

        $this->postJson("/api/admin/imports/{$importId}/approve", [
            'override_missing_visuals' => true,
        ])->assertOk();
    }

    private function createDraftImport(): int
    {
        $response = $this->postJson('/api/admin/imports/json', [
            'raw_json' => json_encode($this->validPaperJson(), JSON_PRETTY_PRINT),
        ]);

        return (int) $response->json('data.id');
    }

    private function validPaperJson(): array
    {
        return [
            'paper' => [
                'title' => 'Cambridge IGCSE Biology 0610/42',
                'board' => 'Cambridge',
                'level' => 'IGCSE',
                'subject' => 'Biology',
                'paper_code' => '0610/42',
                'session' => 'May/June',
                'year' => 2024,
                'duration_minutes' => 75,
                'total_marks' => 80,
                'instructions' => 'Answer all questions.',
            ],
            'questions' => [
                [
                    'question_key' => '1(a)',
                    'parent_key' => null,
                    'sort_order' => 1,
                    'question_type' => 'short_answer',
                    'answer_interaction_type' => 'select_single',
                    'interaction_config' => ['options' => ['green colour', 'broad surface area', 'thick cuticle']],
                    'stem_context' => 'Photosynthesis and leaves',
                    'question_text' => 'State two observable features of a healthy leaf.',
                    'max_marks' => 2,
                    'reference_answer' => 'Green colour and broad surface area.',
                    'marking_guidelines' => 'Accept any two visible features.',
                    'sample_full_mark_answer' => 'A healthy leaf is green and has a broad flat blade.',
                    'requires_visual_reference' => false,
                    'visual_reference_type' => null,
                    'visual_reference_note' => '',
                    'source' => ['question_page' => 1, 'mark_scheme_page' => 2],
                    'flags' => ['needs_review' => false, 'has_visual' => false, 'low_confidence_match' => false],
                ],
                [
                    'question_key' => '2(a)',
                    'parent_key' => null,
                    'sort_order' => 2,
                    'question_type' => 'diagram_label',
                    'answer_interaction_type' => 'diagram_annotation',
                    'interaction_config' => ['base_image_required' => true, 'canvas_overlay' => true, 'allow_text_labels' => true],
                    'stem_context' => 'Use the labelled cell diagram.',
                    'question_text' => 'Label the nucleus and the cell membrane on the diagram.',
                    'max_marks' => 2,
                    'reference_answer' => 'Nucleus; cell membrane.',
                    'marking_guidelines' => 'Accept labels that clearly indicate both structures.',
                    'sample_full_mark_answer' => 'The nucleus should be labelled in the centre and the membrane on the outer boundary.',
                    'requires_visual_reference' => true,
                    'visual_reference_type' => 'diagram',
                    'visual_reference_note' => 'Requires the original labelled cell diagram.',
                    'source' => ['question_page' => 3, 'mark_scheme_page' => 6],
                    'flags' => ['needs_review' => true, 'has_visual' => true, 'low_confidence_match' => false],
                ],
                [
                    'question_key' => '2(b)',
                    'parent_key' => '2',
                    'sort_order' => 3,
                    'question_type' => 'table',
                    'answer_interaction_type' => 'table_input',
                    'interaction_config' => ['columns' => [['key' => 'feature', 'label' => 'Feature', 'readonly' => true], ['key' => 'answer', 'label' => 'Answer', 'readonly' => false]], 'rows' => [['key' => 'cell_wall', 'feature' => 'cell wall']]],
                    'stem_context' => 'Refer to the results table.',
                    'question_text' => 'Complete the table to compare plant and animal cells.',
                    'max_marks' => 3,
                    'reference_answer' => 'Plant cells have a cell wall and chloroplasts; animal cells do not.',
                    'marking_guidelines' => 'Credit correct entries in the table.',
                    'sample_full_mark_answer' => 'Plant cells: cell wall, chloroplasts, large vacuole. Animal cells: none of these.',
                    'requires_visual_reference' => false,
                    'visual_reference_type' => null,
                    'visual_reference_note' => '',
                    'source' => ['question_page' => 4, 'mark_scheme_page' => 7],
                    'flags' => ['needs_review' => false, 'has_visual' => false, 'low_confidence_match' => false],
                ],
                [
                    'question_key' => '3(a)',
                    'parent_key' => '3',
                    'sort_order' => 4,
                    'question_type' => 'structured',
                    'answer_interaction_type' => 'multi_field',
                    'interaction_config' => ['fields' => [['key' => 'increase', 'label' => 'Increase', 'type' => 'text'], ['key' => 'decrease', 'label' => 'Decrease', 'type' => 'text']]],
                    'stem_context' => 'Investigate how temperature affects enzyme activity.',
                    'question_text' => 'Explain the effect of temperature on enzyme activity.',
                    'max_marks' => 4,
                    'reference_answer' => 'Activity increases to an optimum, then decreases due to denaturation.',
                    'marking_guidelines' => 'Credit linked statements about collisions and denaturation.',
                    'sample_full_mark_answer' => 'Increasing temperature raises kinetic energy and collisions until the optimum; after that the enzyme changes shape and activity falls.',
                    'requires_visual_reference' => false,
                    'visual_reference_type' => null,
                    'visual_reference_note' => '',
                    'source' => ['question_page' => 5, 'mark_scheme_page' => 9],
                    'flags' => ['needs_review' => false, 'has_visual' => false, 'low_confidence_match' => false],
                ],
            ],
        ];
    }
}
