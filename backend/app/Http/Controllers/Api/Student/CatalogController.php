<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaperListResource;
use App\Services\Papers\PaperCatalogService;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
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
}
