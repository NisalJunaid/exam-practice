<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DocumentImportStatus;
use App\Enums\ImportMatchStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveDocumentImportRequest;
use App\Http\Requests\Admin\StoreDocumentImportRequest;
use App\Http\Requests\Admin\StoreImportItemVisualRequest;
use App\Http\Requests\Admin\UpdateDocumentImportItemRequest;
use App\Http\Resources\DocumentImportItemResource;
use App\Http\Resources\DocumentImportResource;
use App\Http\Resources\QuestionVisualAssetResource;
use App\Models\DocumentImport;
use App\Models\DocumentImportItem;
use App\Models\QuestionVisualAsset;
use App\Services\Imports\ImportApprovalService;
use App\Services\Imports\ImportVisualAssetService;
use App\Services\Imports\JsonPaperImportService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class PaperImportController extends Controller
{
    public function index(): JsonResponse
    {
        $imports = DocumentImport::query()->withCount('items')->latest()->get();

        return response()->json(['data' => DocumentImportResource::collection($imports)]);
    }

    public function store(StoreDocumentImportRequest $request, JsonPaperImportService $service): JsonResponse
    {
        $import = $service->createDraft($request->validated(), $request->user());

        return response()->json(['data' => new DocumentImportResource($import->load(['items.visualAssets']))], 201);
    }

    public function show(DocumentImport $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json(['data' => new DocumentImportResource($import->load(['items.visualAssets']))]);
    }

    public function items(DocumentImport $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json(['data' => DocumentImportItemResource::collection($import->items()->with('visualAssets')->get())]);
    }

    public function updateItem(UpdateDocumentImportItemRequest $request, DocumentImportItem $item): JsonResponse
    {
        $import = $item->documentImport;
        $this->authorize('update', $import);

        if ($import->status !== DocumentImportStatus::NeedsReview) {
            abort(422, 'Only imports in needs_review can be edited.');
        }

        $validated = $request->validated();
        $flags = $validated['flags'];
        $hasVisual = (bool) ($flags['has_visual'] ?? false) || $item->visualAssets()->exists();
        $status = $this->determineReviewStatus(
            requiresVisualReference: (bool) $validated['requires_visual_reference'],
            hasVisual: $hasVisual,
            needsReview: (bool) ($flags['needs_review'] ?? false),
            lowConfidenceMatch: (bool) ($flags['low_confidence_match'] ?? false),
        );

        $item->update([
            'question_key' => $validated['question_key'],
            'question_number' => $validated['question_number'] ?? $item->question_number,
            'parent_key' => $validated['parent_key'] ?? null,
            'question_type' => $validated['question_type'],
            'answer_interaction_type' => $validated['answer_interaction_type'],
            'interaction_config' => $validated['interaction_config'],
            'stem_context' => $validated['stem_context'] ?? null,
            'question_text' => $validated['question_text'],
            'reference_answer' => $validated['reference_answer'] ?? null,
            'marking_guidelines' => $validated['marking_guidelines'] ?? null,
            'sample_full_mark_answer' => $validated['sample_full_mark_answer'] ?? null,
            'resolved_max_marks' => $validated['resolved_max_marks'],
            'requires_visual_reference' => $validated['requires_visual_reference'],
            'visual_reference_type' => $validated['visual_reference_type'] ?? null,
            'visual_reference_note' => $validated['visual_reference_note'] ?? null,
            'has_visual' => $hasVisual,
            'flags' => [
                'needs_review' => (bool) ($flags['needs_review'] ?? false),
                'has_visual' => $hasVisual,
                'low_confidence_match' => (bool) ($flags['low_confidence_match'] ?? false),
            ],
            'question_page_number' => $validated['question_page_number'] ?? $item->question_page_number,
            'mark_scheme_page_number' => $validated['mark_scheme_page_number'] ?? $item->mark_scheme_page_number,
            'match_status' => $status,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'is_approved' => $validated['is_approved'] ?? false,
        ]);

        $import->update(['summary' => $this->summarizeItems($import)]);

        return response()->json(['data' => new DocumentImportItemResource($item->fresh('visualAssets'))]);
    }

    public function uploadVisuals(StoreImportItemVisualRequest $request, DocumentImportItem $item, ImportVisualAssetService $service): JsonResponse
    {
        $this->authorize('update', $item->documentImport);

        $assets = $service->attachToDraftItem($item, $request->file('files', []), $request->string('asset_role')->toString() ?: null);
        $item->documentImport->update(['summary' => $this->summarizeItems($item->documentImport)]);

        return response()->json([
            'data' => QuestionVisualAssetResource::collection(collect($assets)),
            'item' => new DocumentImportItemResource($item->fresh('visualAssets')),
        ], 201);
    }

    public function destroyVisual(QuestionVisualAsset $visual, ImportVisualAssetService $service): JsonResponse
    {
        $item = $visual->importItem;
        abort_unless($item, 404);
        $this->authorize('update', $item->documentImport);

        $service->deleteDraftAsset($visual);
        $item->documentImport->update(['summary' => $this->summarizeItems($item->documentImport)]);

        return response()->json(['message' => 'Draft visual deleted.']);
    }

    public function approve(ApproveDocumentImportRequest $request, DocumentImport $import, ImportApprovalService $service): JsonResponse
    {
        $this->authorize('update', $import);

        try {
            $paper = $service->approve($import, (bool) $request->boolean('override_missing_visuals'));
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
        $items = $import->items()->with('visualAssets')->get();

        return [
            'totalItems' => $items->count(),
            'readyItems' => $items->where('match_status', ImportMatchStatus::Ready)->count(),
            'needsReviewItems' => $items->where('match_status', ImportMatchStatus::NeedsReview)->count(),
            'warningItems' => $items->where('match_status', ImportMatchStatus::Warning)->count(),
            'visualDependentItems' => $items->where('requires_visual_reference', true)->count(),
            'missingRequiredVisuals' => $items->filter(fn ($item) => $item->requires_visual_reference && $item->visualAssets->isEmpty())->count(),
        ];
    }

    private function determineReviewStatus(bool $requiresVisualReference, bool $hasVisual, bool $needsReview, bool $lowConfidenceMatch): ImportMatchStatus
    {
        if ($requiresVisualReference && ! $hasVisual) {
            return ImportMatchStatus::MissingVisual;
        }

        if ($needsReview || $lowConfidenceMatch) {
            return ImportMatchStatus::Warning;
        }

        return ImportMatchStatus::Ready;
    }
}
