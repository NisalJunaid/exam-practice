<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreAttemptAnswersRequest;
use App\Http\Resources\Student\PaperAttemptResource;
use App\Models\Paper;
use App\Models\PaperAttempt;
use App\Services\Attempts\AttemptService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class AttemptController extends Controller
{
    public function __construct(private readonly AttemptService $service)
    {
    }

    public function store(Paper $paper): JsonResponse
    {
        abort_unless($paper->is_published, 404);

        $attempt = $this->service->createAttempt(request()->user(), $paper->load('questions', 'subject'));

        return response()->json(['data' => new PaperAttemptResource($attempt)], 201);
    }

    public function show(PaperAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        return response()->json(['data' => new PaperAttemptResource($this->service->getAttempt($attempt))]);
    }

    public function updateAnswers(StoreAttemptAnswersRequest $request, PaperAttempt $attempt): JsonResponse
    {
        $this->authorize('update', $attempt);

        try {
            $attempt = $this->service->saveAnswers($attempt, $request->validated('answers'));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => new PaperAttemptResource($attempt)]);
    }

    public function submit(PaperAttempt $attempt): JsonResponse
    {
        $this->authorize('update', $attempt);

        try {
            $attempt = $this->service->submit($attempt);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['data' => new PaperAttemptResource($attempt)]);
    }
}
