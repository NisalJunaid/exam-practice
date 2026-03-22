<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AttemptReviewResource extends AttemptResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        return [
            ...$data,
            'review' => [
                'questions' => $data['questions'],
                'markingSummary' => $data['markingSummary'],
            ],
        ];
    }
}
