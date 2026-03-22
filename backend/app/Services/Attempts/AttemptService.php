<?php

namespace App\Services\Attempts;

use App\Enums\PaperAttemptStatus;
use App\Jobs\ProcessAttemptMarkingJob;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AttemptService
{
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
                    'is_blank' => true,
                ]);
            }

            return $attempt->load(['paper.subject', 'paper.questions', 'answers', 'markings']);
        });
    }

    public function getAttempt(PaperAttempt $attempt): PaperAttempt
    {
        return $attempt->load(['paper.subject', 'paper.questions', 'answers', 'markings']);
    }

    public function saveAnswers(PaperAttempt $attempt, array $answers): PaperAttempt
    {
        if ($attempt->status !== PaperAttemptStatus::InProgress) {
            throw new RuntimeException('Only in-progress attempts can be edited.');
        }

        DB::transaction(function () use ($attempt, $answers) {
            foreach ($answers as $payload) {
                $answer = $attempt->answers()->where('paper_question_id', Arr::get($payload, 'paper_question_id'))->firstOrFail();
                $text = trim((string) Arr::get($payload, 'student_answer', ''));

                $answer->update([
                    'student_answer' => $text !== '' ? $text : null,
                    'is_blank' => $text === '',
                ]);
            }
        });

        return $this->getAttempt($attempt);
    }

    public function submit(PaperAttempt $attempt): PaperAttempt
    {
        if (! $attempt->isSubmittable()) {
            throw new RuntimeException('This attempt cannot be submitted.');
        }

        $attempt->update([
            'status' => PaperAttemptStatus::Submitted,
            'submitted_at' => Carbon::now(),
        ]);

        $attempt->answers()->update(['submitted_at' => Carbon::now()]);

        ProcessAttemptMarkingJob::dispatchSync($attempt->fresh());

        return $this->getAttempt($attempt->fresh());
    }
}
