<?php

namespace App\Services\Marking;

use App\Enums\AiMarkingLogStatus;
use App\Enums\PaperAttemptStatus;
use App\Models\AttemptAnswer;
use App\Models\PaperAttempt;
use App\Models\PaperQuestion;
use App\Services\Marking\Contracts\MarkingProvider;
use Illuminate\Support\Facades\DB;
use Throwable;

class MarkingOrchestrator
{
    public function __construct(
        private readonly MarkingProvider $provider,
        private readonly MarkingPromptBuilder $promptBuilder,
        private readonly MarkingResponseValidator $validator,
    ) {}

    public function markAttempt(PaperAttempt $attempt): PaperAttempt
    {
        $attempt->loadMissing(['paper.questions.rubric', 'answers', 'markings']);
        $attempt->update([
            'status' => PaperAttemptStatus::Marking,
            'completed_at' => null,
            'marking_summary' => 'AI marking in progress.',
        ]);

        try {
            DB::transaction(function () use ($attempt) {
                $attempt->markings()->delete();

                foreach ($attempt->paper->questions->sortBy('order_index') as $question) {
                    $answer = $attempt->answers->firstWhere('paper_question_id', $question->id);
                    $marking = $this->markSingleAnswer($attempt, $question, $answer);

                    $attempt->markings()->updateOrCreate(
                        ['paper_question_id' => $question->id],
                        [
                            'attempt_answer_id' => $answer?->id,
                            'paper_question_id' => $question->id,
                            'awarded_marks' => $marking['awarded_marks'],
                            'max_marks' => $question->max_marks,
                            'reasoning' => $marking['reasoning'],
                            'feedback' => $marking['feedback'],
                            'strengths' => $marking['strengths'],
                            'mistakes' => $marking['mistakes'],
                            'ai_confidence' => $marking['ai_confidence'],
                        ],
                    );
                }
            });
        } catch (Throwable $throwable) {
            $attempt->update([
                'status' => PaperAttemptStatus::Failed,
                'completed_at' => now(),
                'marking_summary' => 'AI marking failed for this attempt.',
            ]);

            $attempt->aiLogs()->create([
                'provider' => $this->provider->providerName(),
                'model_name' => $this->provider->modelName(),
                'request_payload' => json_encode(['attempt_id' => $attempt->id], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                'response_payload' => null,
                'status' => AiMarkingLogStatus::Failed,
                'error_message' => $throwable->getMessage(),
            ]);

            throw $throwable;
        }

        $totals = $this->calculateTotals($attempt->markings()->get(['awarded_marks', 'max_marks']));

        $attempt->update([
            'status' => PaperAttemptStatus::Completed,
            'completed_at' => now(),
            'total_awarded_marks' => $totals['awarded_marks'],
            'total_max_marks' => $totals['max_marks'],
            'marking_summary' => sprintf('Marked automatically. Score: %d/%d.', $totals['awarded_marks'], $totals['max_marks']),
        ]);

        return $attempt->fresh(['paper.subject', 'paper.questions', 'answers', 'markings']);
    }

    public function calculateTotals(iterable $markings): array
    {
        $awarded = 0;
        $maxMarks = 0;

        foreach ($markings as $marking) {
            $awarded += (int) data_get($marking, 'awarded_marks', 0);
            $maxMarks += (int) data_get($marking, 'max_marks', 0);
        }

        return [
            'awarded_marks' => $awarded,
            'max_marks' => $maxMarks,
        ];
    }

    private function markSingleAnswer(PaperAttempt $attempt, PaperQuestion $question, ?AttemptAnswer $answer): array
    {
        $isBlank = $answer?->is_blank ?? trim((string) $answer?->student_answer) === '';

        if ($isBlank) {
            $result = $this->validator->blankAnswerResult($question);
            $this->persistAiLog(
                $attempt,
                $answer,
                ['skipped' => true, 'reason' => 'blank_answer', 'question_id' => $question->id],
                $result,
                AiMarkingLogStatus::Success,
            );

            return $result;
        }

        $maxAttempts = (int) config('ai_marking.max_output_retries', 2) + 1;
        $lastError = null;
        $prompt = $this->promptBuilder->build($question, $answer);

        for ($attemptNumber = 1; $attemptNumber <= $maxAttempts; $attemptNumber++) {
            $providerResponse = $this->provider->generateMarking($prompt);

            try {
                $normalized = $this->validator->validateAndNormalize($providerResponse['content'] ?? '', $question, $answer);
                $this->persistAiLog(
                    $attempt,
                    $answer,
                    $providerResponse['request_payload'] ?? ['prompt' => $prompt],
                    $providerResponse['response_payload'] ?? ['content' => $providerResponse['content'] ?? null],
                    AiMarkingLogStatus::Success,
                    sprintf('Attempt %d/%d', $attemptNumber, $maxAttempts),
                );

                return $normalized;
            } catch (Throwable $throwable) {
                $lastError = $throwable;
                $this->persistAiLog(
                    $attempt,
                    $answer,
                    $providerResponse['request_payload'] ?? ['prompt' => $prompt],
                    $providerResponse['response_payload'] ?? ['content' => $providerResponse['content'] ?? null],
                    AiMarkingLogStatus::InvalidOutput,
                    sprintf('Attempt %d/%d: %s', $attemptNumber, $maxAttempts, $throwable->getMessage()),
                );
            }
        }

        throw $lastError ?? new \RuntimeException('AI marking failed with no response.');
    }

    private function persistAiLog(
        PaperAttempt $attempt,
        ?AttemptAnswer $answer,
        array $requestPayload,
        ?array $responsePayload,
        AiMarkingLogStatus $status,
        ?string $errorMessage = null,
    ): void {
        $attempt->aiLogs()->create([
            'attempt_answer_id' => $answer?->id,
            'provider' => $this->provider->providerName(),
            'model_name' => $this->provider->modelName(),
            'request_payload' => json_encode($requestPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'response_payload' => $responsePayload === null
                ? null
                : json_encode($responsePayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'status' => $status,
            'error_message' => $errorMessage,
        ]);
    }
}
