<?php

namespace App\Services\Marking;

use App\Enums\AiMarkingLogStatus;
use App\Enums\PaperAttemptStatus;
use App\Models\PaperAttempt;
use App\Services\AI\FakeMarkingProvider;
use Illuminate\Support\Facades\DB;
use Throwable;

class AttemptMarkingService
{
    public function __construct(private readonly FakeMarkingProvider $provider)
    {
    }

    public function markAttempt(PaperAttempt $attempt): PaperAttempt
    {
        $attempt->load(['paper.questions.rubric', 'answers']);
        $attempt->update(['status' => PaperAttemptStatus::Marking]);

        try {
            DB::transaction(function () use ($attempt) {
                $attempt->markings()->delete();

                foreach ($attempt->paper->questions as $question) {
                    $answer = $attempt->answers->firstWhere('paper_question_id', $question->id);
                    $result = $this->provider->mark($question, $answer?->student_answer);

                    $attempt->markings()->create([
                        'attempt_answer_id' => $answer?->id,
                        'paper_question_id' => $question->id,
                        'awarded_marks' => $result['awarded_marks'],
                        'max_marks' => $question->max_marks,
                        'reasoning' => $result['reasoning'],
                        'feedback' => $result['feedback'],
                        'strengths' => $result['strengths'],
                        'mistakes' => $result['mistakes'],
                        'ai_confidence' => $result['ai_confidence'],
                    ]);

                    $attempt->aiLogs()->create([
                        'attempt_answer_id' => $answer?->id,
                        'provider' => config('services.ai_marking.provider', 'fake'),
                        'model_name' => config('services.ai_marking.model', 'deterministic-reviewer'),
                        'request_payload' => json_encode([
                            'question_id' => $question->id,
                            'student_answer' => $answer?->student_answer,
                        ], JSON_PRETTY_PRINT),
                        'response_payload' => json_encode($result, JSON_PRETTY_PRINT),
                        'status' => AiMarkingLogStatus::Success,
                    ]);
                }
            });
        } catch (Throwable $throwable) {
            $attempt->update([
                'status' => PaperAttemptStatus::Failed,
                'marking_summary' => 'AI marking failed for this attempt.',
            ]);

            $attempt->aiLogs()->create([
                'provider' => config('services.ai_marking.provider', 'fake'),
                'model_name' => config('services.ai_marking.model', 'deterministic-reviewer'),
                'request_payload' => '{}',
                'status' => AiMarkingLogStatus::Failed,
                'error_message' => $throwable->getMessage(),
            ]);

            throw $throwable;
        }

        $attempt->refresh();
        $awarded = $attempt->calculateAwardedMarks();

        $attempt->update([
            'status' => PaperAttemptStatus::Completed,
            'completed_at' => now(),
            'total_awarded_marks' => $awarded,
            'marking_summary' => sprintf('Marked automatically. Score: %d/%d.', $awarded, $attempt->total_max_marks),
        ]);

        return $attempt->fresh(['paper.subject', 'paper.questions', 'answers', 'markings']);
    }
}
