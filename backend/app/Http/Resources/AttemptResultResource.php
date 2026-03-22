<?php

namespace App\Http\Resources;

use App\Services\Attempts\AttemptReviewBuilder;
use Illuminate\Http\Request;

class AttemptResultResource extends AttemptResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $builder = app(AttemptReviewBuilder::class);

        return [
            ...$data,
            'result' => $builder->buildResultsPayload($this->resource),
        ];
    }
}
