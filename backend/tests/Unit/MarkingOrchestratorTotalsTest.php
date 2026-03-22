<?php

namespace Tests\Unit;

use App\Services\AI\FakeMarkingProvider;
use App\Services\Marking\MarkingOrchestrator;
use App\Services\Marking\MarkingPromptBuilder;
use App\Services\Marking\MarkingResponseValidator;
use Illuminate\Support\Collection;
use Tests\TestCase;

class MarkingOrchestratorTotalsTest extends TestCase
{
    public function test_it_calculates_attempt_totals_from_stored_markings(): void
    {
        $orchestrator = new MarkingOrchestrator(
            new FakeMarkingProvider,
            new MarkingPromptBuilder,
            new MarkingResponseValidator,
        );

        $totals = $orchestrator->calculateTotals(new Collection([
            ['awarded_marks' => 3, 'max_marks' => 5],
            ['awarded_marks' => 2, 'max_marks' => 2],
            ['awarded_marks' => 0, 'max_marks' => 3],
        ]));

        $this->assertSame(['awarded_marks' => 5, 'max_marks' => 10], $totals);
    }
}
