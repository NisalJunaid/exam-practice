<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DocumentImportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDocumentImportRequest;
use App\Http\Resources\Admin\DocumentImportItemResource;
use App\Http\Resources\Admin\DocumentImportResource;
use App\Jobs\ProcessPaperImportJob;
use App\Models\DocumentImport;
use App\Services\Imports\ImportApprovalService;
use Illuminate\Http\JsonResponse;

class ImportController extends Controller
{
    public function index(): JsonResponse
    {
        $imports = DocumentImport::query()->with('items')->latest()->get();

        return response()->json(['data' => DocumentImportResource::collection($imports)]);
    }

    public function store(StoreDocumentImportRequest $request): JsonResponse
    {
        $questionPaper = $request->file('question_paper');
        $markScheme = $request->file('mark_scheme');

        $import = DocumentImport::create([
            'created_by' => $request->user()->id,
            'status' => DocumentImportStatus::Uploaded,
            'question_paper_path' => $questionPaper->store('imports/question-papers'),
            'question_paper_name' => $questionPaper->getClientOriginalName(),
            'mark_scheme_path' => $markScheme->store('imports/mark-schemes'),
            'mark_scheme_name' => $markScheme->getClientOriginalName(),
        ]);

        $import->update(['status' => DocumentImportStatus::Processing]);
        ProcessPaperImportJob::dispatchSync($import->fresh());

        return response()->json(['data' => new DocumentImportResource($import->fresh('items'))], 201);
    }

    public function show(DocumentImport $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json(['data' => new DocumentImportResource($import->load('items'))]);
    }

    public function items(DocumentImport $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json(['data' => DocumentImportItemResource::collection($import->items()->get())]);
    }

    public function approve(DocumentImport $import, ImportApprovalService $service): JsonResponse
    {
        $this->authorize('update', $import);
        $paper = $service->approve($import);

        return response()->json([
            'message' => 'Import approved and published.',
            'data' => [
                'paperId' => $paper->id,
                'paperTitle' => $paper->title,
            ],
        ]);
    }
}
