<?php

namespace Tests\Feature;

use App\Enums\AiMarkingLogStatus;
use App\Enums\PaperAttemptStatus;
use App\Enums\UserRole;
use App\Jobs\MarkPaperAttemptJob;
use App\Models\AiMarkingLog;
use App\Models\ExamBoard;
use App\Models\ExamLevel;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Models\PaperQuestion;
use App\Models\QuestionRubric;
use App\Models\Subject;
use App\Models\User;
use App\Services\Marking\Contracts\MarkingProvider;
use App\Services\Marking\MarkingOrchestrator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AttemptSubmissionMarkingPipelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_submission_queues_marking_job_and_results_are_built_from_stored_markings(): void
    {
        [$student, $paper] = $this->createStudentWithPublishedPaper();
        Sanctum::actingAs($student);

        Queue::fake();
        app()->bind(MarkingProvider::class, fn () => new class implements MarkingProvider
        {
            private int $calls = 0;

            public function providerName(): string
            {
                return 'test-double';
            }

            public function modelName(): string
            {
                return 'test-model';
            }

            public function generateMarking(array $prompt): array
            {
                $this->calls++;
                $questionKey = data_get($prompt, 'context.question.question_key');

                if ($questionKey === '1(a)' && $this->calls === 1) {
                    return [
                        'request_payload' => ['attempt' => $this->calls, 'question_key' => $questionKey],
                        'response_payload' => ['content' => '{malformed'],
                        'content' => '{malformed',
                    ];
                }

                $payload = $questionKey === '1(a)'
                    ? [
                        'awarded_marks' => 3,
                        'reasoning' => 'Matched the expected reactants.',
                        'feedback' => 'Keep naming both reactants directly.',
                        'strengths' => ['Named carbon dioxide', 'Named water'],
                        'mistakes' => [],
                        'ai_confidence' => 0.9,
                    ]
                    : [
                        'awarded_marks' => 1,
                        'reasoning' => 'Included chlorophyll but with limited precision.',
                        'feedback' => 'State the pigment name on its own for full marks.',
                        'strengths' => ['Included chlorophyll'],
                        'mistakes' => ['Could be more concise'],
                        'ai_confidence' => 0.72,
                    ];

                return [
                    'request_payload' => ['attempt' => $this->calls, 'question_key' => $questionKey],
                    'response_payload' => ['content' => json_encode($payload)],
                    'content' => json_encode($payload),
                ];
            }
        });

        $attemptId = $this->postJson("/api/student/papers/{$paper->id}/attempts")->json('data.id');

        $questions = $paper->questions()->orderBy('order_index')->get();
        $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => [
                [
                    'paper_question_id' => $questions[0]->id,
                    'student_answer' => 'Carbon dioxide and water.',
                ],
                [
                    'paper_question_id' => $questions[1]->id,
                    'student_answer' => 'Chlorophyll',
                ],
            ],
        ])->assertOk();

        $submitResponse = $this->postJson("/api/student/attempts/{$attemptId}/submit");
        $submitResponse
            ->assertOk()
            ->assertJsonPath('data.status', PaperAttemptStatus::Submitted->value)
            ->assertJsonPath('data.result.status', PaperAttemptStatus::Submitted->value)
            ->assertJsonPath('data.result.questions.0.awardedMarks', null);

        $queuedJob = null;
        Queue::assertPushed(MarkPaperAttemptJob::class, function (MarkPaperAttemptJob $job) use ($attemptId, &$queuedJob) {
            $queuedJob = $job;

            return $job->attemptId === $attemptId;
        });

        $this->getJson("/api/student/attempts/{$attemptId}/results")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Results are only available after marking has finished.');

        $queuedJob->handle(app(MarkingOrchestrator::class));

        $attempt = PaperAttempt::query()->findOrFail($attemptId);
        $this->assertSame(PaperAttemptStatus::Completed, $attempt->status);
        $this->assertSame(4, $attempt->total_awarded_marks);
        $this->assertSame('Marked automatically. Score: 4/5.', $attempt->marking_summary);
        $this->assertDatabaseCount('attempt_markings', 2);
        $this->assertDatabaseHas('attempt_markings', [
            'paper_attempt_id' => $attemptId,
            'paper_question_id' => $questions[0]->id,
            'awarded_marks' => 3,
        ]);
        $this->assertDatabaseHas('attempt_markings', [
            'paper_attempt_id' => $attemptId,
            'paper_question_id' => $questions[1]->id,
            'awarded_marks' => 1,
        ]);

        $this->assertSame(1, AiMarkingLog::query()->where('status', AiMarkingLogStatus::InvalidOutput)->count());
        $this->assertSame(2, AiMarkingLog::query()->where('status', AiMarkingLogStatus::Success)->count());

        $resultsResponse = $this->getJson("/api/student/attempts/{$attemptId}/results");
        $resultsResponse
            ->assertOk()
            ->assertJsonPath('data.result.status', PaperAttemptStatus::Completed->value)
            ->assertJsonPath('data.result.totalAwardedMarks', 4)
            ->assertJsonPath('data.result.questions.0.awardedMarks', 3)
            ->assertJsonMissingPath('data.aiLogs')
            ->assertJsonMissingPath('data.result.questions.0.requestPayload');

        $reviewResponse = $this->getJson("/api/student/attempts/{$attemptId}/review");
        $reviewResponse
            ->assertOk()
            ->assertJsonPath('data.review.questions.0.reasoning', 'Matched the expected reactants.')
            ->assertJsonPath('data.review.questions.1.awardedMarks', 1)
            ->assertJsonMissingPath('data.review.questions.0.responsePayload');
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

        $questionOne = PaperQuestion::factory()->for($paper)->create([
            'question_number' => '1',
            'question_key' => '1(a)',
            'question_text' => 'State the reactants needed for photosynthesis.',
            'reference_answer' => 'Carbon dioxide and water.',
            'marking_guidelines' => 'Mention both reactants.',
            'max_marks' => 3,
            'order_index' => 1,
        ]);
        QuestionRubric::factory()->for($questionOne, 'question')->create([
            'keywords_expected' => ['carbon dioxide', 'water'],
            'marker_notes' => 'Accept either order.',
        ]);

        $questionTwo = PaperQuestion::factory()->for($paper)->create([
            'question_number' => '2',
            'question_key' => '1(b)',
            'question_text' => 'Name the pigment that absorbs light.',
            'reference_answer' => 'Chlorophyll.',
            'marking_guidelines' => 'Name chlorophyll.',
            'max_marks' => 2,
            'order_index' => 2,
        ]);
        QuestionRubric::factory()->for($questionTwo, 'question')->create([
            'keywords_expected' => ['chlorophyll'],
            'marker_notes' => 'Do not credit vague references to pigment only.',
        ]);

        return [$student, $paper->fresh(['subject.examBoard', 'subject.examLevel', 'questions'])];
    }
}
