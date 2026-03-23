<?php

namespace App\Services\Attempts;

use App\Enums\PaperAttemptStatus;
use App\Jobs\MarkPaperAttemptJob;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Models\User;
use App\Support\AnswerInteractions\AnswerInteractionSchema;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AttemptService
{
    public function __construct(private readonly AnswerInteractionSchema $interactionSchema) {}

    public function createAttempt(User $user, Paper $paper): PaperAttempt
    {
        return DB::transaction(function () use ($user, $paper) {
            $attempt = PaperAttempt::create([
                'user_id' => $user->id,
                'paper_id' => $paper->id,
                'status' => PaperAttemptStatus::InProgress,
                'started_at' => now(),
                'total_max_marks' => $paper->total_marks,
            ]);

            foreach ($paper->questions as $question) {
                $attempt->answers()->create([
                    'paper_question_id' => $question->id,
                    'student_answer' => null,
                    'structured_answer' => null,
                    'is_blank' => true,
                ]);
            }

            return $this->getAttempt($attempt);
        });
    }

    public function getAttempt(PaperAttempt $attempt): PaperAttempt
    {
        $attempt = $this->synchronizeTimeoutState($attempt);

        return $this->loadAttempt($attempt);
    }

    public function saveAnswers(PaperAttempt $attempt, array $answers): PaperAttempt
    {
        $attempt = $this->synchronizeTimeoutState($attempt);

        if ($attempt->status !== PaperAttemptStatus::InProgress) {
            throw new RuntimeException($attempt->hasTimedOut() ? 'Time has expired. Your attempt was submitted automatically.' : 'Only in-progress attempts can be edited.');
        }

        DB::transaction(function () use ($attempt, $answers) {
            foreach ($answers as $payload) {
                $questionId = Arr::get($payload, 'paper_question_id');
                $answer = $attempt->answers()->with('question')->where('paper_question_id', $questionId)->first();

                if (! $answer) {
                    throw new RuntimeException('One or more answers do not belong to this attempt.');
                }

                $question = $answer->question;
                $structuredAnswer = Arr::get($payload, 'structured_answer');
                $structuredAnswer = is_array($structuredAnswer) ? $structuredAnswer : null;
                $providedText = Arr::get($payload, 'student_answer');
                $providedText = is_string($providedText) ? trim($providedText) : null;

                $normalizedText = $this->interactionSchema->summarizeAnswer(
                    $question->answer_interaction_type?->value ?? (string) $question->answer_interaction_type,
                    $providedText,
                    $structuredAnswer,
                );
                $normalizedText = trim($normalizedText);
                $isBlank = $this->interactionSchema->isBlank($normalizedText, $structuredAnswer);

                $answer->update([
                    'student_answer' => $normalizedText !== '' ? $normalizedText : null,
                    'structured_answer' => $structuredAnswer,
                    'is_blank' => $isBlank,
                ]);
            }
        });

        return $this->getAttempt($attempt);
    }

    public function submitAttempt(PaperAttempt $attempt, bool $force = false): PaperAttempt
    {
        $submittedAttempt = DB::transaction(function () use ($attempt, $force): PaperAttempt {
            $lockedAttempt = PaperAttempt::query()
                ->whereKey($attempt->id)
                ->lockForUpdate()
                ->with('paper')
                ->firstOrFail();

            if ($lockedAttempt->status !== PaperAttemptStatus::InProgress) {
                return $lockedAttempt;
            }

            if ($force || $lockedAttempt->hasTimedOut()) {
                return $this->transitionToSubmitted(
                    $lockedAttempt,
                    summary: 'Time expired. The attempt was submitted automatically and AI marking has been queued.',
                );
            }

            return $this->transitionToSubmitted($lockedAttempt);
        });

        return $this->getAttempt($submittedAttempt->fresh());
    }

    public function ensureResultsAvailable(PaperAttempt $attempt): void
    {
        if (! in_array($attempt->status, [PaperAttemptStatus::Completed, PaperAttemptStatus::Failed], true)) {
            throw new RuntimeException('Results are only available after marking has finished.');
        }
    }

    public function ensureReviewAvailable(PaperAttempt $attempt): void
    {
        if ($attempt->status !== PaperAttemptStatus::Completed) {
            throw new RuntimeException('Review is only available after marking has completed successfully.');
        }
    }

    private function synchronizeTimeoutState(PaperAttempt $attempt): PaperAttempt
    {
        $attempt->loadMissing('paper');

        if ($attempt->status === PaperAttemptStatus::InProgress && $attempt->hasTimedOut()) {
            return $this->submitAttempt($attempt, force: true);
        }

        return $attempt;
    }

    private function transitionToSubmitted(PaperAttempt $attempt, ?Carbon $submittedAt = null, ?string $summary = null): PaperAttempt
    {
        $submittedAt ??= Carbon::now();

        $attempt->update([
            'status' => PaperAttemptStatus::Submitted,
            'submitted_at' => $submittedAt,
            'completed_at' => null,
            'total_awarded_marks' => null,
            'marking_summary' => $summary ?? 'Attempt submitted. AI marking has been queued.',
        ]);

        $attempt->answers()->update(['submitted_at' => $submittedAt]);

        MarkPaperAttemptJob::dispatch($attempt->id);

        return $attempt;
    }

    private function loadAttempt(PaperAttempt $attempt): PaperAttempt
    {
        return $attempt->load(['paper.subject.examBoard', 'paper.subject.examLevel', 'paper.questions.visualAssets', 'answers.assets', 'markings']);
    }
}
