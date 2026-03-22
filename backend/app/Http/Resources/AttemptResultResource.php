<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AttemptResultResource extends AttemptResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        return [
            ...$data,
            'result' => [
                'status' => $data['status'],
                'totalAwardedMarks' => $data['totalAwardedMarks'],
                'totalMaxMarks' => $data['totalMaxMarks'],
                'markingSummary' => $data['markingSummary'],
            ],
        ];
    }
}
