<?php

namespace Tests\Feature;

use App\Enums\PaperAttemptStatus;
use App\Enums\UserRole;
use App\Models\AttemptMarking;
use App\Models\ExamBoard;
use App\Models\ExamLevel;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Models\PaperQuestion;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentPaperBrowsingAndAttemptLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_list_only_published_papers_and_catalog_filters(): void
    {
        [$student, $publishedPaper] = $this->createStudentWithPublishedPaper();

        $draftPaper = Paper::factory()->for($publishedPaper->subject)->create([
            'title' => 'Draft paper',
            'is_published' => false,
        ]);

        Sanctum::actingAs($student);

        $catalogResponse = $this->getJson('/api/student/catalog');
        $catalogResponse
            ->assertOk()
            ->assertJsonPath('data.examBoards.0.id', $publishedPaper->subject->examBoard->id)
            ->assertJsonPath('data.examLevels.0.id', $publishedPaper->subject->examLevel->id)
            ->assertJsonPath('data.subjects.0.id', $publishedPaper->subject->id);

        $listResponse = $this->getJson('/api/student/papers');
        $listResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $publishedPaper->id)
            ->assertJsonMissingPath('data.1');

        $filteredResponse = $this->getJson('/api/student/papers?subject_id='.$draftPaper->subject_id.'&q='.urlencode('Published'));
        $filteredResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $publishedPaper->id);
    }

    public function test_student_can_view_published_paper_detail_without_reference_answers(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        $question = $paper->questions()->firstOrFail();
        Sanctum::actingAs($student);

        $response = $this->getJson("/api/student/papers/{$paper->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $paper->id)
            ->assertJsonPath('data.questions.0.id', $question->id)
            ->assertJsonMissingPath('data.questions.0.referenceAnswer')
            ->assertJsonMissingPath('data.questions.0.markingGuidelines');
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_student_can_create_attempt_and_save_answers_as_drafts(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        Sanctum::actingAs($student);

        $createResponse = $this->postJson("/api/student/papers/{$paper->id}/attempts");

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.status', PaperAttemptStatus::InProgress->value)
            ->assertJsonPath('data.totalMaxMarks', $paper->total_marks)
            ->assertJsonPath('data.questions.0.studentAnswer', null)
            ->assertJsonPath('data.questions.0.answerInteractionType', 'calculation_with_working')
            ->assertJsonPath('data.questions.0.isBlank', true);

        $attemptId = $createResponse->json('data.id');
        $questions = $paper->questions()->orderBy('order_index')->get();

        $saveResponse = $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => [
                [
                    'paper_question_id' => $questions[0]->id,
                    'student_answer' => '0.080 dm3',
                    'structured_answer' => ['final_answer' => '0.080 dm3', 'working' => '25.0 cm3 = 0.025 dm3'],
                ],
            ],
        ]);

        $saveResponse
            ->assertOk()
            ->assertJsonPath('data.questions.0.studentAnswer', "Final answer: 0.080 dm3\n\nWorking: 25.0 cm3 = 0.025 dm3")
            ->assertJsonPath('data.questions.0.structuredAnswer.final_answer', '0.080 dm3')
            ->assertJsonPath('data.questions.0.isBlank', false)
            ->assertJsonPath('data.questions.1.studentAnswer', null)
            ->assertJsonPath('data.questions.1.isBlank', true);
    }


    public function test_student_can_upload_answer_assets_and_review_payload_contains_them(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        Sanctum::actingAs($student);

        $attemptId = $this->postJson("/api/student/papers/{$paper->id}/attempts")->json('data.id');
        $firstQuestion = $paper->questions()->orderBy('order_index')->firstOrFail();

        $assetResponse = $this->post("/api/student/attempts/{$attemptId}/answer-assets", [
            'paper_question_id' => $firstQuestion->id,
            'asset_type' => 'drawing',
            'file' => UploadedFile::fake()->image('working.png'),
        ], ['Accept' => 'application/json']);

        $assetResponse
            ->assertCreated()
            ->assertJsonPath('data.assetType', 'drawing');

        $assetId = $assetResponse->json('data.id');

        $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => [[
                'paper_question_id' => $firstQuestion->id,
                'structured_answer' => ['drawing_asset_id' => $assetId, 'notes' => 'Graph sketch'],
            ]],
        ])->assertOk()
            ->assertJsonPath('data.questions.0.answerAssets.0.id', $assetId)
            ->assertJsonPath('data.questions.0.answerAssets.0.metadata.paper_question_id', $firstQuestion->id)
            ->assertJsonPath('data.questions.0.structuredAnswer.drawing_asset_id', $assetId);
    }

    public function test_student_can_submit_attempt_and_fetch_results_and_review_after_marking_completes(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        Sanctum::actingAs($student);

        $attemptId = $this->postJson("/api/student/papers/{$paper->id}/attempts")->json('data.id');

        $questions = $paper->questions()->orderBy('order_index')->get();
        $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => $questions->map(fn (PaperQuestion $question) => [
                'paper_question_id' => $question->id,
                'student_answer' => 'Final answer: 0.080 dm3',
                'structured_answer' => ['final_answer' => '0.080 dm3', 'working' => 'Method shown'],
            ])->all(),
        ])->assertOk();

        $submitResponse = $this->postJson("/api/student/attempts/{$attemptId}/submit");
        $submitResponse
            ->assertOk()
            ->assertJsonPath('data.status', PaperAttemptStatus::Completed->value)
            ->assertJsonPath('data.result.status', PaperAttemptStatus::Completed->value)
            ->assertJsonPath('data.result.questions.0.awardedMarks', 2);

        $resultsResponse = $this->getJson("/api/student/attempts/{$attemptId}/results");
        $resultsResponse
            ->assertOk()
            ->assertJsonPath('data.result.totalMaxMarks', $paper->total_marks)
            ->assertJsonMissingPath('data.result.questions.0.referenceAnswer');

        $reviewResponse = $this->getJson("/api/student/attempts/{$attemptId}/review");
        $reviewResponse
            ->assertOk()
            ->assertJsonPath('data.review.questions.0.referenceAnswer', '0.080 dm3')
            ->assertJsonPath('data.review.questions.0.markingGuidelines', 'Award marks for correct final answer and clear working.');
    }

    public function test_results_and_review_enforce_attempt_ownership_and_completion_rules(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        $otherStudent = User::factory()->create(['role' => UserRole::Student]);

        $inProgressAttempt = PaperAttempt::factory()->for($student)->for($paper)->create([
            'status' => PaperAttemptStatus::InProgress,
            'started_at' => now(),
            'submitted_at' => null,
            'completed_at' => null,
            'total_awarded_marks' => null,
            'marking_summary' => null,
        ]);
        $this->seedAttemptAnswers($inProgressAttempt, $paper);

        $completedAttempt = PaperAttempt::factory()->for($student)->for($paper)->create([
            'status' => PaperAttemptStatus::Completed,
            'started_at' => now()->subHour(),
            'submitted_at' => now()->subMinutes(30),
            'completed_at' => now(),
            'total_awarded_marks' => 3,
            'total_max_marks' => $paper->total_marks,
            'marking_summary' => 'Marked automatically. Score: 3/5.',
        ]);
        $answers = $this->seedAttemptAnswers($completedAttempt, $paper, submitted: true, withText: 'A marked answer');

        $paperQuestions = $paper->questions()->orderBy('order_index')->get();
        foreach ($answers as $index => $answer) {
            $question = $paperQuestions[$index];
            AttemptMarking::factory()->create([
                'paper_attempt_id' => $completedAttempt->id,
                'attempt_answer_id' => $answer->id,
                'paper_question_id' => $question->id,
                'awarded_marks' => $index === 0 ? 3 : 0,
                'max_marks' => $question->max_marks,
                'reasoning' => 'Matched the key points.',
                'feedback' => 'Keep using precise terminology.',
                'strengths' => ['Included the correct final answer'],
                'mistakes' => [],
            ]);
        }

        Sanctum::actingAs($student);
        $this->getJson("/api/student/attempts/{$inProgressAttempt->id}/results")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Results are only available after marking has finished.');
        $this->getJson("/api/student/attempts/{$inProgressAttempt->id}/review")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Review is only available after marking has completed successfully.');

        Sanctum::actingAs($otherStudent);
        $this->getJson("/api/student/attempts/{$completedAttempt->id}/results")->assertForbidden();
        $this->getJson("/api/student/attempts/{$completedAttempt->id}/review")->assertForbidden();
    }



    public function test_attempt_payload_includes_question_visuals(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper(includeVisual: true);
        Sanctum::actingAs($student);

        $response = $this->postJson("/api/student/papers/{$paper->id}/attempts");

        $response
            ->assertCreated()
            ->assertJsonPath('data.questions.0.visualAssets.0.assetRole', 'diagram')
            ->assertJsonPath('data.questions.0.visualAssets.0.altText', 'Leaf diagram');
    }

    public function test_attempt_payload_uses_latest_saved_answer_interaction_type_and_config(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        $question = $paper->questions()->orderBy('order_index')->firstOrFail();
        $question->update([
            'answer_interaction_type' => 'multi_field',
            'interaction_config' => [
                'fields' => [
                    ['key' => 'final', 'label' => 'Final answer'],
                    ['key' => 'evidence', 'label' => 'Evidence'],
                ],
            ],
        ]);

        Sanctum::actingAs($student);

        $response = $this->postJson("/api/student/papers/{$paper->id}/attempts");

        $response
            ->assertCreated()
            ->assertJsonPath('data.questions.0.answerInteractionType', 'multi_field')
            ->assertJsonPath('data.questions.0.interactionConfig.fields.0.key', 'final')
            ->assertJsonPath('data.questions.0.interactionConfig.fields.1.label', 'Evidence');
    }

    public function test_attempt_payload_includes_canvas_draw_metadata_question_key_and_visual_references(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper(includeVisual: true);
        $question = $paper->questions()->orderBy('order_index')->firstOrFail();
        $question->update([
            'question_type' => 'diagram_label',
            'answer_interaction_type' => 'canvas_draw',
            'interaction_config' => [
                'canvas' => [
                    'width' => 960,
                    'height' => 540,
                    'background_mode' => 'plain',
                    'allow_pen' => true,
                    'allow_eraser' => true,
                    'allow_clear' => true,
                    'allow_grid' => false,
                ],
            ],
        ]);

        Sanctum::actingAs($student);

        $this->postJson("/api/student/papers/{$paper->id}/attempts")
            ->assertCreated()
            ->assertJsonPath('data.questions.0.questionKey', '1(a)')
            ->assertJsonPath('data.questions.0.answerInteractionType', 'canvas_draw')
            ->assertJsonPath('data.questions.0.interactionConfig.canvas.width', 960)
            ->assertJsonPath('data.questions.0.visualAssets.0.assetRole', 'diagram')
            ->assertJsonPath('data.questions.0.visualAssets.0.altText', 'Leaf diagram');
    }

    public function test_review_payload_contains_answer_asset_preview_urls_and_question_visual_urls(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper(includeVisual: true);
        Sanctum::actingAs($student);

        $attemptId = $this->postJson("/api/student/papers/{$paper->id}/attempts")->json('data.id');
        $firstQuestion = $paper->questions()->orderBy('order_index')->firstOrFail();

        $assetId = $this->post("/api/student/attempts/{$attemptId}/answer-assets", [
            'paper_question_id' => $firstQuestion->id,
            'asset_type' => 'drawing',
            'file' => UploadedFile::fake()->image('canvas.png'),
            'metadata' => json_encode(['width' => 640, 'height' => 480]),
        ], ['Accept' => 'application/json'])->json('data.id');

        $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => [[
                'paper_question_id' => $firstQuestion->id,
                'structured_answer' => ['drawing_asset_id' => $assetId, 'notes' => 'Annotated leaf'],
            ]],
        ])->assertOk();

        $this->postJson("/api/student/attempts/{$attemptId}/submit")->assertOk();

        $this->getJson("/api/student/attempts/{$attemptId}/review")
            ->assertOk()
            ->assertJsonPath('data.review.questions.0.visualAssets.0.url', 'http://localhost/storage/question-visuals/leaf-diagram.png')
            ->assertJsonPath('data.review.questions.0.answerAssets.0.metadata.width', 640)
            ->assertJson(fn ($json) => $json->where('data.review.questions.0.answerAssets.0.url', fn ($value) => is_string($value) && str_contains($value, '/storage/attempt-answers/'))->etc());
    }

    public function test_expired_attempt_is_auto_submitted_when_student_returns(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        Sanctum::actingAs($student);

        $attempt = PaperAttempt::factory()->for($student)->for($paper)->create([
            'status' => PaperAttemptStatus::InProgress,
            'started_at' => now()->subMinutes(80),
            'submitted_at' => null,
            'completed_at' => null,
            'total_max_marks' => $paper->total_marks,
        ]);
        $this->seedAttemptAnswers($attempt, $paper);

        $response = $this->getJson("/api/student/attempts/{$attempt->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.status', PaperAttemptStatus::Completed->value)
            ->assertJsonPath('data.markingSummary', 'Marked automatically. Score: 0/5.');
    }

    public function test_manual_submit_near_timeout_returns_existing_submitted_attempt_without_race_failure(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        Sanctum::actingAs($student);

        $attempt = PaperAttempt::factory()->for($student)->for($paper)->create([
            'status' => PaperAttemptStatus::InProgress,
            'started_at' => now()->subMinutes(75),
            'submitted_at' => null,
            'completed_at' => null,
            'total_max_marks' => $paper->total_marks,
        ]);
        $this->seedAttemptAnswers($attempt, $paper);

        $firstResponse = $this->postJson("/api/student/attempts/{$attempt->id}/submit");
        $secondResponse = $this->postJson("/api/student/attempts/{$attempt->id}/submit");

        $firstResponse->assertOk()->assertJsonPath('data.status', PaperAttemptStatus::Completed->value);
        $secondResponse->assertOk()->assertJsonPath('data.status', PaperAttemptStatus::Completed->value);
    }

    private function createStudentWithPublishedPaper(bool $includeVisual = false): array
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        $examBoard = ExamBoard::factory()->create(['name' => 'Cambridge']);
        $examLevel = ExamLevel::factory()->create(['name' => 'A Level']);
        $subject = Subject::factory()->for($examBoard)->for($examLevel)->create([
            'name' => 'Biology',
            'code' => '9700',
        ]);

        $paper = Paper::factory()->for($subject)->create([
            'title' => 'Published Biology Paper',
            'paper_code' => '9700/21',
            'year' => 2024,
            'session' => 'May/June',
            'duration_minutes' => 75,
            'total_marks' => 5,
            'is_published' => true,
        ]);

        $firstQuestion = PaperQuestion::factory()->for($paper)->create([
            'question_number' => '1',
            'question_key' => '1(a)',
            'question_text' => 'Calculate the concentration and show your working.',
            'reference_answer' => '0.080 dm3',
            'marking_guidelines' => 'Award marks for correct final answer and clear working.',
            'max_marks' => 3,
            'question_type' => 'calculation',
            'answer_interaction_type' => 'calculation_with_working',
            'interaction_config' => ['final_answer_label' => 'Final Answer', 'working_label' => 'Working', 'allow_units' => true],
            'order_index' => 1,
            'has_visual' => $includeVisual,
            'requires_visual_reference' => $includeVisual,
            'visual_reference_type' => $includeVisual ? 'diagram' : null,
        ]);

        if ($includeVisual) {
            $firstQuestion->visualAssets()->create([
                'asset_role' => 'diagram',
                'disk' => 'public',
                'file_path' => 'question-visuals/leaf-diagram.png',
                'original_name' => 'leaf-diagram.png',
                'alt_text' => 'Leaf diagram',
                'caption' => 'Reference diagram for labelling.',
                'mime_type' => 'image/png',
                'sort_order' => 1,
            ]);
        }
        PaperQuestion::factory()->for($paper)->create([
            'question_number' => '2',
            'question_key' => '1(b)',
            'question_text' => 'State the pigment that absorbs light.',
            'reference_answer' => 'Chlorophyll.',
            'question_type' => 'short_answer',
            'answer_interaction_type' => 'short_text',
            'interaction_config' => [],
            'marking_guidelines' => 'Name chlorophyll.',
            'max_marks' => 2,
            'order_index' => 2,
        ]);

        return [$student, $paper->fresh(['subject.examBoard', 'subject.examLevel', 'questions'])];
    }

    private function seedAttemptAnswers(PaperAttempt $attempt, Paper $paper, bool $submitted = false, ?string $withText = null)
    {
        return $paper->questions()->orderBy('order_index')->get()->map(function (PaperQuestion $question) use ($attempt, $submitted, $withText) {
            return $attempt->answers()->create([
                'paper_question_id' => $question->id,
                'student_answer' => $withText,
                'is_blank' => $withText === null,
                'submitted_at' => $submitted ? now() : null,
            ]);
        });
    }
}
