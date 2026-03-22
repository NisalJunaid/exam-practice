<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaperRequest;
use App\Http\Requests\Admin\UpdatePaperRequest;
use App\Http\Resources\AdminPaperResource;
use App\Models\Paper;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PaperAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $papers = Paper::query()
            ->with(['subject.examBoard', 'subject.examLevel', 'questions'])
            ->latest('id')
            ->get();

        return response()->json(['data' => AdminPaperResource::collection($papers)]);
    }

    public function store(StorePaperRequest $request): JsonResponse
    {
        $paper = Paper::query()->create([
            ...$request->validated(),
            'slug' => $request->validated('slug') ?: Str::slug($request->string('title')->toString().'-'.now()->timestamp),
        ]);

        return response()->json([
            'message' => 'Paper created.',
            'data' => new AdminPaperResource($paper->load(['subject.examBoard', 'subject.examLevel', 'questions'])),
        ], 201);
    }

    public function show(Paper $paper): JsonResponse
    {
        return response()->json([
            'data' => new AdminPaperResource($paper->load(['subject.examBoard', 'subject.examLevel', 'questions'])),
        ]);
    }

    public function update(UpdatePaperRequest $request, Paper $paper): JsonResponse
    {
        $paper->update($request->validated());

        return response()->json([
            'message' => 'Paper updated.',
            'data' => new AdminPaperResource($paper->fresh()->load(['subject.examBoard', 'subject.examLevel', 'questions'])),
        ]);
    }

    public function destroy(Paper $paper): JsonResponse
    {
        $paper->delete();

        return response()->json(['message' => 'Paper deleted.']);
    }

    public function publish(Paper $paper): JsonResponse
    {
        $paper->update(['is_published' => true]);

        return response()->json([
            'message' => 'Paper published.',
            'data' => new AdminPaperResource($paper->fresh()->load(['subject.examBoard', 'subject.examLevel', 'questions'])),
        ]);
    }

    public function unpublish(Paper $paper): JsonResponse
    {
        $paper->update(['is_published' => false]);

        return response()->json([
            'message' => 'Paper unpublished.',
            'data' => new AdminPaperResource($paper->fresh()->load(['subject.examBoard', 'subject.examLevel', 'questions'])),
        ]);
    }
}
