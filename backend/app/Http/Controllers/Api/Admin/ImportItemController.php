<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateDocumentImportItemRequest;
use App\Http\Resources\Admin\DocumentImportItemResource;
use App\Models\DocumentImportItem;
use Illuminate\Http\JsonResponse;

class ImportItemController extends Controller
{
    public function update(UpdateDocumentImportItemRequest $request, DocumentImportItem $item): JsonResponse
    {
        $this->authorize('update', $item->documentImport);

        $item->update($request->validated());

        return response()->json(['data' => new DocumentImportItemResource($item->fresh())]);
    }
}
