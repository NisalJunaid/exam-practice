<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\StoreImportItemVisualRequest;
use App\Http\Requests\Admin\UpdateDocumentImportItemRequest;
use App\Models\DocumentImportItem;
use App\Models\QuestionVisualAsset;
use App\Services\Imports\ImportVisualAssetService;
use Illuminate\Http\JsonResponse;

class ImportItemController extends PaperImportController
{
    public function update(UpdateDocumentImportItemRequest $request, DocumentImportItem $item): JsonResponse
    {
        return $this->updateItem($request, $item);
    }

    public function storeVisuals(StoreImportItemVisualRequest $request, DocumentImportItem $item, ImportVisualAssetService $service): JsonResponse
    {
        return $this->uploadVisuals($request, $item, $service);
    }

    public function destroyVisual(QuestionVisualAsset $visual, ImportVisualAssetService $service): JsonResponse
    {
        return parent::destroyVisual($visual, $service);
    }
}
