<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Paper;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentAttemptFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_start_submit_and_review_a_marked_attempt(): void
    {
        $this->seed();

        $student = User::query()->where('role', UserRole::Student)->firstOrFail();
        $paper = Paper::query()->where('is_published', true)->firstOrFail();
        Sanctum::actingAs($student);

        $startResponse = $this->postJson("/api/student/papers/{$paper->id}/attempts");
        $startResponse->assertCreated();

        $attemptId = $startResponse->json('data.id');
        $questions = $startResponse->json('data.questions');

        $saveResponse = $this->putJson("/api/student/attempts/{$attemptId}/answers", [
            'answers' => collect($questions)->map(fn (array $question) => [
                'paper_question_id' => $question['id'],
                'student_answer' => 'carbon dioxide water chlorophyll reliability anomalies',
            ])->all(),
        ]);

        $saveResponse->assertOk();

        $submitResponse = $this->postJson("/api/student/attempts/{$attemptId}/submit");
        $submitResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.questions.0.review.referenceAnswer', 'Carbon dioxide and water.');
    }
}
