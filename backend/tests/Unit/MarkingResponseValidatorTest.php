<?php

namespace Tests\Unit;

use App\Models\AttemptAnswer;
use App\Models\PaperQuestion;
use App\Services\Marking\Exceptions\InvalidMarkingResponseException;
use App\Services\Marking\MarkingResponseValidator;
use Tests\TestCase;

class MarkingResponseValidatorTest extends TestCase
{
    public function test_it_normalizes_and_clamps_ai_marking_output(): void
    {
        $question = new PaperQuestion(['max_marks' => 4]);
        $answer = new AttemptAnswer(['student_answer' => 'A response', 'is_blank' => false]);

        $result = app(MarkingResponseValidator::class)->validateAndNormalize([
            'awarded_marks' => 7,
            'reasoning' => "  Covers most points.\n",
            'feedback' => ' Add one more precise keyword. ',
            'strengths' => [' Accurate use of osmosis ', '', 'Clear structure'],
            'mistakes' => ['Missed water potential'],
            'ai_confidence' => 1.4,
        ], $question, $answer);

        $this->assertSame(4, $result['awarded_marks']);
        $this->assertSame('Covers most points.', $result['reasoning']);
        $this->assertSame('Add one more precise keyword.', $result['feedback']);
        $this->assertSame(['Accurate use of osmosis', 'Clear structure'], $result['strengths']);
        $this->assertSame(['Missed water potential'], $result['mistakes']);
        $this->assertSame(1.0, $result['ai_confidence']);
    }

    public function test_it_forces_blank_answers_to_zero_marks(): void
    {
        $question = new PaperQuestion(['max_marks' => 3]);
        $answer = new AttemptAnswer(['student_answer' => null, 'is_blank' => true]);

        $result = app(MarkingResponseValidator::class)->validateAndNormalize([
            'awarded_marks' => 2,
            'reasoning' => 'Some answer content found.',
            'feedback' => 'Try again.',
            'strengths' => ['Something'],
            'mistakes' => [],
            'ai_confidence' => 0.6,
        ], $question, $answer);

        $this->assertSame(0, $result['awarded_marks']);
        $this->assertSame([], $result['strengths']);
        $this->assertContains('Blank response', $result['mistakes']);
        $this->assertSame('No answer was submitted, so no marks could be awarded.', $result['reasoning']);
    }

    public function test_it_rejects_non_json_like_payloads(): void
    {
        $this->expectException(InvalidMarkingResponseException::class);

        $question = new PaperQuestion(['max_marks' => 1]);

        app(MarkingResponseValidator::class)->validateAndNormalize('not-json', $question, null);
    }
}
