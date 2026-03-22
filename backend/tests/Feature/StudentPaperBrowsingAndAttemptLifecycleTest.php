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
            ->assertJsonPath('data.questions.0.isBlank', true);

        $attemptId = $createResponse->json('data.id');
        $questions = $paper->questions()->orderBy('order_index')->get();

        $saveResponse = $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => [
                [
                    'paper_question_id' => $questions[0]->id,
                    'student_answer' => 'First draft answer',
                ],
            ],
        ]);

        $saveResponse
            ->assertOk()
            ->assertJsonPath('data.questions.0.studentAnswer', 'First draft answer')
            ->assertJsonPath('data.questions.0.isBlank', false)
            ->assertJsonPath('data.questions.1.studentAnswer', null)
            ->assertJsonPath('data.questions.1.isBlank', true);
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
                'student_answer' => 'Carbon dioxide and water with chlorophyll.',
            ])->all(),
        ])->assertOk();

        $submitResponse = $this->postJson("/api/student/attempts/{$attemptId}/submit");
        $submitResponse
            ->assertOk()
            ->assertJsonPath('data.status', PaperAttemptStatus::Completed->value)
            ->assertJsonPath('data.result.status', PaperAttemptStatus::Completed->value)
            ->assertJsonPath('data.result.questions.0.awardedMarks', 3);

        $resultsResponse = $this->getJson("/api/student/attempts/{$attemptId}/results");
        $resultsResponse
            ->assertOk()
            ->assertJsonPath('data.result.totalMaxMarks', $paper->total_marks)
            ->assertJsonMissingPath('data.result.questions.0.referenceAnswer');

        $reviewResponse = $this->getJson("/api/student/attempts/{$attemptId}/review");
        $reviewResponse
            ->assertOk()
            ->assertJsonPath('data.review.questions.0.referenceAnswer', 'Carbon dioxide and water.')
            ->assertJsonPath('data.review.questions.0.markingGuidelines', 'Mention both reactants.');
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
                'strengths' => ['Included the core reactants'],
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

    private function createStudentWithPublishedPaper(): array
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

        PaperQuestion::factory()->for($paper)->create([
            'question_number' => '1',
            'question_key' => '1(a)',
            'question_text' => 'State the reactants needed for photosynthesis.',
            'reference_answer' => 'Carbon dioxide and water.',
            'marking_guidelines' => 'Mention both reactants.',
            'max_marks' => 3,
            'order_index' => 1,
        ]);
        PaperQuestion::factory()->for($paper)->create([
            'question_number' => '2',
            'question_key' => '1(b)',
            'question_text' => 'Name the pigment that absorbs light.',
            'reference_answer' => 'Chlorophyll.',
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
