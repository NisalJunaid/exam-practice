<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Http\Resources\AdminQuestionResource;
use App\Models\Paper;
use App\Models\PaperQuestion;
use Illuminate\Http\JsonResponse;

class QuestionAdminController extends Controller
{
    public function store(StoreQuestionRequest $request, Paper $paper): JsonResponse
    {
        $question = $paper->questions()->create($request->validated());
        $paper->update(['total_marks' => $paper->calculateTotalMarks()]);

        return response()->json([
            'message' => 'Question created.',
            'data' => new AdminQuestionResource($question->fresh('paper')),
        ], 201);
    }

    public function show(PaperQuestion $question): JsonResponse
    {
        return response()->json(['data' => new AdminQuestionResource($question->load('paper'))]);
    }

    public function update(UpdateQuestionRequest $request, PaperQuestion $question): JsonResponse
    {
        $question->update($request->validated());
        $question->paper->update(['total_marks' => $question->paper->calculateTotalMarks()]);

        return response()->json([
            'message' => 'Question updated.',
            'data' => new AdminQuestionResource($question->fresh('paper')),
        ]);
    }

    public function destroy(PaperQuestion $question): JsonResponse
    {
        $paper = $question->paper;
        $question->delete();
        $paper->update(['total_marks' => $paper->calculateTotalMarks()]);

        return response()->json(['message' => 'Question deleted.']);
    }
}
