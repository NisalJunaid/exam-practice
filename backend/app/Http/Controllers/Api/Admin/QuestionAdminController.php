<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRubricRequest;
use App\Http\Resources\AdminQuestionResource;
use App\Models\Paper;
use App\Models\PaperQuestion;
use App\Services\Papers\Admin\AdminQuestionService;
use Illuminate\Http\JsonResponse;

class QuestionAdminController extends Controller
{
    public function __construct(private readonly AdminQuestionService $service) {}

    public function store(StoreQuestionRequest $request, Paper $paper): JsonResponse
    {
        return response()->json([
            'message' => 'Question created.',
            'data' => new AdminQuestionResource($this->service->create($paper, $request->validated())),
        ], 201);
    }

    public function show(PaperQuestion $question): JsonResponse
    {
        return response()->json([
            'data' => new AdminQuestionResource($this->service->get($question)),
        ]);
    }

    public function update(UpdateQuestionRequest $request, PaperQuestion $question): JsonResponse
    {
        return response()->json([
            'message' => 'Question updated.',
            'data' => new AdminQuestionResource($this->service->update($question, $request->validated())),
        ]);
    }

    public function updateRubric(UpdateQuestionRubricRequest $request, PaperQuestion $question): JsonResponse
    {
        return response()->json([
            'message' => 'Question rubric updated.',
            'data' => new AdminQuestionResource($this->service->updateRubric($question, $request->validated())),
        ]);
    }

    public function destroy(PaperQuestion $question): JsonResponse
    {
        $this->service->delete($question);

        return response()->json(['message' => 'Question deleted.']);
    }
}
