<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\UpdateDocumentImportItemRequest;
use App\Models\DocumentImportItem;
use Illuminate\Http\JsonResponse;

class ImportItemController extends PaperImportController
{
    public function update(UpdateDocumentImportItemRequest $request, DocumentImportItem $item): JsonResponse
    {
        return $this->updateItem($request, $item);
    }
}
