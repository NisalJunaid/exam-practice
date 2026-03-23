<?php

namespace Tests\Feature;

use App\Enums\PaperAttemptStatus;
use App\Enums\UserRole;
use App\Models\AttemptAnswer;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Models\PaperQuestion;
use App\Models\QuestionRubric;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminPaperQuestionCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create([
            'role' => UserRole::Admin,
        ]));
    }

    public function test_admin_can_list_create_view_update_publish_and_delete_papers(): void
    {
        $subject = Subject::factory()->create();
        $existingPaper = Paper::factory()->for($subject)->create();

        $listResponse = $this->getJson('/api/admin/papers');

        $listResponse
            ->assertOk()
            ->assertJsonPath('data.0.id', $existingPaper->id);

        $createResponse = $this->postJson('/api/admin/papers', [
            'subject_id' => $subject->id,
            'title' => 'Admin Managed Physics Paper',
            'paper_code' => 'P2',
            'year' => 2026,
            'session' => 'May/June',
            'duration_minutes' => 95,
            'instructions' => 'Answer every question.',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.title', 'Admin Managed Physics Paper')
            ->assertJsonPath('data.totalMarks', 0);

        $paperId = $createResponse->json('data.id');

        $this->postJson("/api/admin/papers/{$paperId}/questions", [
            'question_key' => '1(a)',
            'question_text' => 'Describe one use of radioactive isotopes.',
            'reference_answer' => 'They can be used as medical tracers.',
            'max_marks' => 4,
            'marking_guidelines' => 'Allow any accurate example tied to tracing or treatment.',
            'sample_full_mark_answer' => 'Radioactive isotopes can be used in medicine to trace substances in the body.',
            'order_index' => 1,
        ])->assertCreated();

        $showResponse = $this->getJson("/api/admin/papers/{$paperId}");

        $showResponse
            ->assertOk()
            ->assertJsonPath('data.questions.0.questionKey', '1(a)')
            ->assertJsonPath('data.questionCount', 1)
            ->assertJsonPath('data.totalMarks', 4);

        $updateResponse = $this->putJson("/api/admin/papers/{$paperId}", [
            'title' => 'Updated Admin Physics Paper',
            'duration_minutes' => 100,
            'instructions' => 'Answer all questions and show working.',
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Admin Physics Paper')
            ->assertJsonPath('data.durationMinutes', 100);

        $publishResponse = $this->postJson("/api/admin/papers/{$paperId}/publish");

        $publishResponse
            ->assertOk()
            ->assertJsonPath('data.isPublished', true)
            ->assertJsonPath('data.totalMarks', 4);

        $deleteResponse = $this->deleteJson("/api/admin/papers/{$paperId}");

        $deleteResponse->assertOk()->assertJsonPath('message', 'Paper deleted.');

        $this->assertDatabaseMissing('papers', ['id' => $paperId]);
        $this->assertDatabaseMissing('paper_questions', ['paper_id' => $paperId]);
    }

    public function test_admin_can_create_update_show_update_rubric_and_delete_questions(): void
    {
        $paper = Paper::factory()->for(Subject::factory())->create(['total_marks' => 0]);

        $createResponse = $this->postJson("/api/admin/papers/{$paper->id}/questions", [
            'question_key' => '2(a)',
            'stem_context' => 'A student investigates osmosis in potato cylinders.',
            'question_text' => 'Explain why the potato mass changes in distilled water.',
            'reference_answer' => 'Water moves into the cells by osmosis through a partially permeable membrane.',
            'max_marks' => 5,
            'marking_guidelines' => 'Credit references to water potential, osmosis, and partially permeable membranes.',
            'sample_full_mark_answer' => 'Distilled water has a higher water potential, so water enters the potato cells by osmosis.',
            'order_index' => 2,
            'rubric' => [
                'band_descriptor' => 'Clear explanation linked to osmosis.',
                'keywords_expected' => ['osmosis', 'water potential'],
                'common_mistakes' => ['describes diffusion only'],
                'acceptable_alternatives' => ['water concentration gradient'],
                'marker_notes' => 'Accept equivalent wording for partially permeable membrane.',
            ],
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.questionNumber', '2')
            ->assertJsonPath('data.rubric.keywordsExpected.0', 'osmosis');

        $questionId = $createResponse->json('data.id');

        $showResponse = $this->getJson("/api/admin/questions/{$questionId}");

        $showResponse
            ->assertOk()
            ->assertJsonPath('data.paper.id', $paper->id)
            ->assertJsonPath('data.rubric.bandDescriptor', 'Clear explanation linked to osmosis.');

        $updateResponse = $this->putJson("/api/admin/questions/{$questionId}", [
            'question_text' => 'Explain why the potato gains mass in distilled water.',
            'max_marks' => 6,
            'order_index' => 3,
            'rubric' => [
                'band_descriptor' => 'Precise osmosis explanation with membrane reference.',
                'keywords_expected' => ['osmosis', 'partially permeable membrane'],
                'common_mistakes' => ['says salt enters the cells'],
                'acceptable_alternatives' => ['higher water potential outside the cell'],
                'marker_notes' => 'Credit membrane wording even if water potential is implied.',
            ],
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('data.questionText', 'Explain why the potato gains mass in distilled water.')
            ->assertJsonPath('data.maxMarks', 6)
            ->assertJsonPath('data.paper.totalMarks', 6)
            ->assertJsonPath('data.rubric.bandDescriptor', 'Precise osmosis explanation with membrane reference.');

        $rubricResponse = $this->putJson("/api/admin/questions/{$questionId}/rubric", [
            'keywords_expected' => ['osmosis', 'partially permeable membrane', 'water potential'],
            'common_mistakes' => ['confuses osmosis with active transport'],
            'marker_notes' => 'Reward explicit direction of water movement.',
        ]);

        $rubricResponse
            ->assertOk()
            ->assertJsonPath('data.rubric.keywordsExpected.2', 'water potential')
            ->assertJsonPath('data.rubric.markerNotes', 'Reward explicit direction of water movement.');

        $deleteResponse = $this->deleteJson("/api/admin/questions/{$questionId}");

        $deleteResponse->assertOk()->assertJsonPath('message', 'Question deleted.');

        $this->assertDatabaseMissing('paper_questions', ['id' => $questionId]);
        $this->assertDatabaseMissing('question_rubrics', ['paper_question_id' => $questionId]);
        $this->assertDatabaseHas('papers', ['id' => $paper->id, 'total_marks' => 0]);
    }



    public function test_admin_question_payload_includes_visual_assets_and_can_update_their_metadata(): void
    {
        $paper = Paper::factory()->for(Subject::factory())->create(['total_marks' => 4]);
        $question = PaperQuestion::factory()->for($paper)->create([
            'question_number' => '1',
            'question_key' => '1(a)',
            'answer_interaction_type' => 'short_text',
            'interaction_config' => [],
            'max_marks' => 4,
            'order_index' => 1,
            'has_visual' => true,
            'requires_visual_reference' => true,
            'visual_reference_type' => 'diagram',
        ]);
        $asset = $question->visualAssets()->create([
            'asset_role' => 'diagram',
            'disk' => 'public',
            'file_path' => 'question-visuals/current.png',
            'original_name' => 'current.png',
            'alt_text' => 'Original alt',
            'caption' => null,
            'mime_type' => 'image/png',
            'sort_order' => 1,
        ]);

        $this->getJson("/api/admin/questions/{$question->id}")
            ->assertOk()
            ->assertJsonPath('data.visualAssets.0.altText', 'Original alt');

        $this->putJson("/api/admin/questions/{$question->id}", [
            'question_text' => 'Updated wording with diagram.',
            'max_marks' => 4,
            'order_index' => 1,
            'visual_assets' => [[
                'id' => $asset->id,
                'alt_text' => 'Updated diagram alt text',
                'caption' => 'Updated caption',
                'sort_order' => 1,
            ]],
        ])->assertOk()
            ->assertJsonPath('data.visualAssets.0.altText', 'Updated diagram alt text')
            ->assertJsonPath('data.visualAssets.0.caption', 'Updated caption');
    }

    public function test_admin_question_update_persists_answer_interaction_type_and_interaction_config(): void
    {
        $paper = Paper::factory()->for(Subject::factory())->create(['total_marks' => 6]);
        $question = PaperQuestion::factory()->for($paper)->create([
            'question_number' => '1',
            'question_key' => '1(a)',
            'question_type' => 'short_answer',
            'answer_interaction_type' => 'short_text',
            'interaction_config' => [],
            'max_marks' => 6,
            'order_index' => 1,
        ]);

        $this->putJson("/api/admin/questions/{$question->id}", [
            'question_type' => 'multiple_part',
            'answer_interaction_type' => 'multi_field',
            'interaction_config' => [
                'fields' => [
                    ['key' => 'method', 'label' => 'Method'],
                    ['key' => 'result', 'label' => 'Result'],
                ],
            ],
            'question_text' => 'Explain the method and state the result.',
            'reference_answer' => 'Method and result.',
            'max_marks' => 6,
            'order_index' => 1,
        ])->assertOk()
            ->assertJsonPath('data.answerInteractionType', 'multi_field')
            ->assertJsonPath('data.interactionConfig.fields.0.key', 'method')
            ->assertJsonPath('data.interactionConfig.fields.1.label', 'Result');

        $this->assertDatabaseHas('paper_questions', [
            'id' => $question->id,
            'answer_interaction_type' => 'multi_field',
        ]);

        $question->refresh();
        $this->assertSame([
            'fields' => [
                ['key' => 'method', 'label' => 'Method'],
                ['key' => 'result', 'label' => 'Result'],
            ],
        ], $question->interaction_config);
    }

    public function test_admin_validation_and_safe_delete_guards_block_invalid_changes(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        $paper = Paper::factory()->for(Subject::factory())->create(['total_marks' => 6]);
        $question = PaperQuestion::factory()->for($paper)->create([
            'question_key' => '3(a)',
            'question_number' => '3',
            'order_index' => 1,
            'max_marks' => 6,
        ]);
        QuestionRubric::factory()->for($question, 'question')->create();

        $attempt = PaperAttempt::factory()->for($student)->for($paper)->create([
            'status' => PaperAttemptStatus::Submitted,
            'total_max_marks' => 6,
        ]);

        AttemptAnswer::factory()->create([
            'paper_attempt_id' => $attempt->id,
            'paper_question_id' => $question->id,
        ]);

        $duplicateQuestionResponse = $this->postJson("/api/admin/papers/{$paper->id}/questions", [
            'question_key' => '3(a)',
            'question_text' => 'Duplicate key question',
            'reference_answer' => 'Answer',
            'max_marks' => 2,
            'order_index' => 1,
        ]);

        $duplicateQuestionResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['order_index']);

        $paperDeleteResponse = $this->deleteJson("/api/admin/papers/{$paper->id}");
        $paperDeleteResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['paper']);

        $questionDeleteResponse = $this->deleteJson("/api/admin/questions/{$question->id}");
        $questionDeleteResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['question']);

        $emptyPublishResponse = $this->postJson('/api/admin/papers/'.Paper::factory()->for(Subject::factory())->create()->id.'/publish');
        $emptyPublishResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['paper']);
    }
}
