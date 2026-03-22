<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaperRequest;
use App\Http\Requests\Admin\UpdatePaperRequest;
use App\Http\Resources\AdminPaperResource;
use App\Models\Paper;
use App\Services\Papers\Admin\AdminPaperService;
use Illuminate\Http\JsonResponse;

class PaperAdminController extends Controller
{
    public function __construct(private readonly AdminPaperService $service) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => AdminPaperResource::collection($this->service->list()),
        ]);
    }

    public function store(StorePaperRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Paper created.',
            'data' => new AdminPaperResource($this->service->create($request->validated())),
        ], 201);
    }

    public function show(Paper $paper): JsonResponse
    {
        return response()->json([
            'data' => new AdminPaperResource($this->service->get($paper)),
        ]);
    }

    public function update(UpdatePaperRequest $request, Paper $paper): JsonResponse
    {
        return response()->json([
            'message' => 'Paper updated.',
            'data' => new AdminPaperResource($this->service->update($paper, $request->validated())),
        ]);
    }

    public function destroy(Paper $paper): JsonResponse
    {
        $this->service->delete($paper);

        return response()->json(['message' => 'Paper deleted.']);
    }

    public function publish(Paper $paper): JsonResponse
    {
        return response()->json([
            'message' => 'Paper published.',
            'data' => new AdminPaperResource($this->service->publish($paper)),
        ]);
    }

    public function unpublish(Paper $paper): JsonResponse
    {
        return response()->json([
            'message' => 'Paper unpublished.',
            'data' => new AdminPaperResource($this->service->unpublish($paper)),
        ]);
    }
}
