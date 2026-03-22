<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\Student\PaperDetailResource;
use App\Http\Resources\Student\PaperListResource;
use App\Models\Paper;
use App\Services\Papers\PaperCatalogService;
use Illuminate\Http\JsonResponse;

class PaperController extends Controller
{
    public function __construct(private readonly PaperCatalogService $service)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => PaperListResource::collection($this->service->listPublished()),
        ]);
    }

    public function show(Paper $paper): JsonResponse
    {
        abort_unless($paper->is_published, 404);

        return response()->json([
            'data' => new PaperDetailResource($this->service->getPublishedPaper($paper)),
        ]);
    }
}
