<?php

namespace App\Services\Imports;

use App\Enums\ImportMatchStatus;

class ImportPreviewBuilder
{
    public function build(array $validatedPayload): array
    {
        $questions = $validatedPayload['questions'];
        $typeCounts = [];
        $warningCount = 0;
        $visualCount = 0;
        $missingVisualCount = 0;

        foreach ($questions as $question) {
            $type = $question['question_type'];
            $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;

            if ($question['requires_visual_reference']) {
                $visualCount++;
                $missingVisualCount++;
            }

            if (($question['flags']['needs_review'] ?? false) || ($question['flags']['low_confidence_match'] ?? false)) {
                $warningCount++;
            }
        }

        return [
            'paper' => $validatedPayload['paper'],
            'questionTypes' => $typeCounts,
            'counts' => [
                'totalItems' => count($questions),
                'readyItems' => 0,
                'needsReviewItems' => $warningCount,
                'warningItems' => $warningCount,
                'visualDependentItems' => $visualCount,
                'missingRequiredVisuals' => $missingVisualCount,
            ],
            'statuses' => [
                'defaultItemStatus' => ImportMatchStatus::NeedsReview->value,
            ],
        ];
    }
}
