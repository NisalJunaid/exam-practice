<?php

namespace App\Http\Requests\Admin;

use App\Enums\QuestionVisualAssetRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreImportItemVisualRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif', 'max:5120'],
            'asset_role' => ['nullable', Rule::in(array_column(QuestionVisualAssetRole::cases(), 'value'))],
        ];
    }
}
