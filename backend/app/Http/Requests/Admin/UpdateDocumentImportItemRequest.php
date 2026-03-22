<?php

namespace App\Http\Requests\Admin;

use App\Enums\ImportMatchStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateDocumentImportItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_key' => ['required', 'string', 'max:255'],
            'question_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parent_key' => ['sometimes', 'nullable', 'string', 'max:255'],
            'stem_context' => ['sometimes', 'nullable', 'string'],
            'question_text' => ['required', 'string'],
            'reference_answer' => ['nullable', 'string'],
            'marking_guidelines' => ['nullable', 'string'],
            'resolved_max_marks' => ['required', 'integer', 'min:1', 'max:100'],
            'match_status' => ['required', new Enum(ImportMatchStatus::class)],
            'admin_notes' => ['nullable', 'string'],
            'is_approved' => ['sometimes', 'boolean'],
        ];
    }
}
