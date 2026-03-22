<?php

namespace Tests\Unit;

use App\Models\AttemptAnswer;
use App\Models\PaperQuestion;
use App\Models\QuestionRubric;
use App\Services\Marking\MarkingPromptBuilder;
use Tests\TestCase;

class MarkingPromptBuilderTest extends TestCase
{
    public function test_it_builds_prompt_payload_with_question_answer_and_rubric_context(): void
    {
        $question = new PaperQuestion([
            'question_number' => '3',
            'question_key' => '3(b)',
            'question_text' => 'Explain why enzyme activity falls at high temperatures.',
            'reference_answer' => 'The enzyme denatures and the active site changes shape.',
            'marking_guidelines' => 'Credit denaturation and changed active site shape.',
            'max_marks' => 2,
        ]);
        $question->setRelation('rubric', new QuestionRubric([
            'band_descriptor' => 'Full marks for both denaturation and active site shape.',
            'keywords_expected' => ['denatures', 'active site'],
            'common_mistakes' => ['temperature kills enzyme'],
            'acceptable_alternatives' => ['active site is no longer complementary'],
            'marker_notes' => 'Do not credit vague statements about slowing only.',
        ]));

        $answer = new AttemptAnswer([
            'student_answer' => 'The active site changes shape because the enzyme denatures.',
            'is_blank' => false,
        ]);

        $prompt = app(MarkingPromptBuilder::class)->build($question, $answer);
        $userPayload = json_decode($prompt['user'], true);

        $this->assertStringContainsString('Return JSON only', $prompt['system']);
        $this->assertSame('3(b)', $userPayload['question']['question_key']);
        $this->assertSame(2, $userPayload['question']['max_marks']);
        $this->assertSame(['denatures', 'active site'], $userPayload['question']['rubric']['keywords_expected']);
        $this->assertSame('The active site changes shape because the enzyme denatures.', $userPayload['answer']['student_answer']);
        $this->assertFalse($userPayload['answer']['is_blank']);
        $this->assertArrayHasKey('required_output_schema', $userPayload);
    }
}
