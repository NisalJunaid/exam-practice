<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DocumentImportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveDocumentImportRequest;
use App\Http\Requests\Admin\StoreDocumentImportRequest;
use App\Http\Requests\Admin\UpdateDocumentImportItemRequest;
use App\Http\Resources\DocumentImportItemResource;
use App\Http\Resources\DocumentImportResource;
use App\Models\DocumentImport;
use App\Models\DocumentImportItem;
use App\Services\Imports\ImportApprovalService;
use App\Services\Imports\PaperImportService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class PaperImportController extends Controller
{
    public function index(): JsonResponse
    {
        $imports = DocumentImport::query()->withCount('items')->latest()->get();

        return response()->json(['data' => DocumentImportResource::collection($imports)]);
    }

    public function store(StoreDocumentImportRequest $request, PaperImportService $service): JsonResponse
    {
        $import = $service->createImportFromUpload($request->validated(), $request->user());
        $service->queueProcessing($import);

        return response()->json(['data' => new DocumentImportResource($import->fresh(['items', 'sourceFiles']))], 201);
    }

    public function show(DocumentImport $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json(['data' => new DocumentImportResource($import->load(['items', 'sourceFiles']))]);
    }

    public function items(DocumentImport $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json(['data' => DocumentImportItemResource::collection($import->items()->get())]);
    }

    public function updateItem(UpdateDocumentImportItemRequest $request, DocumentImportItem $item): JsonResponse
    {
        $import = $item->documentImport;
        $this->authorize('update', $import);

        if ($import->status !== DocumentImportStatus::NeedsReview) {
            abort(422, 'Only imports in needs_review can be edited.');
        }

        $item->update($request->validated());
        $import->update(['summary' => array_merge($import->summary ?? [], $this->summarizeItems($import))]);

        return response()->json(['data' => new DocumentImportItemResource($item->fresh())]);
    }

    public function approve(ApproveDocumentImportRequest $request, DocumentImport $import, ImportApprovalService $service): JsonResponse
    {
        $this->authorize('update', $import);

        try {
            $paper = $service->approve($import);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Import approved into draft paper records. Publication remains manual.',
            'data' => [
                'paperId' => $paper->id,
                'paperTitle' => $paper->title,
                'isPublished' => $paper->is_published,
            ],
        ]);
    }

    private function summarizeItems(DocumentImport $import): array
    {
        return [
            'matchedItems' => $import->items()->where('match_status', 'matched')->count(),
            'paperOnlyItems' => $import->items()->where('match_status', 'paper_only')->count(),
            'schemeOnlyItems' => $import->items()->where('match_status', 'scheme_only')->count(),
            'ambiguousItems' => $import->items()->where('match_status', 'ambiguous')->count(),
            'resolvedItems' => $import->items()->where('match_status', 'resolved')->count(),
            'totalItems' => $import->items()->count(),
            'approvedItems' => $import->items()->where('is_approved', true)->count(),
        ];
    }
}
