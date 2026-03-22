<?php

namespace Database\Factories;

use App\Enums\AiMarkingLogStatus;
use App\Models\AiMarkingLog;
use App\Models\AttemptAnswer;
use App\Models\PaperAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiMarkingLog>
 */
class AiMarkingLogFactory extends Factory
{
    protected $model = AiMarkingLog::class;

    public function definition(): array
    {
        return [
            'paper_attempt_id' => PaperAttempt::factory(),
            'attempt_answer_id' => AttemptAnswer::factory(),
            'provider' => 'fake',
            'model_name' => 'deterministic-reviewer',
            'request_payload' => json_encode(['question' => 'Example'], JSON_THROW_ON_ERROR),
            'response_payload' => json_encode(['awarded_marks' => 1], JSON_THROW_ON_ERROR),
            'status' => AiMarkingLogStatus::Success,
            'error_message' => null,
        ];
    }
}
