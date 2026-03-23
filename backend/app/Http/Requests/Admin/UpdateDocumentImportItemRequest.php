<?php

namespace App\Http\Requests\Admin;

use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'question_type' => ['required', Rule::in(array_column(QuestionType::cases(), 'value'))],
            'stem_context' => ['sometimes', 'nullable', 'string'],
            'question_text' => ['required', 'string'],
            'reference_answer' => ['nullable', 'string'],
            'marking_guidelines' => ['nullable', 'string'],
            'sample_full_mark_answer' => ['nullable', 'string'],
            'resolved_max_marks' => ['required', 'integer', 'min:0', 'max:100'],
            'requires_visual_reference' => ['required', 'boolean'],
            'visual_reference_type' => ['nullable', Rule::in(array_column(VisualReferenceType::cases(), 'value'))],
            'visual_reference_note' => ['nullable', 'string'],
            'flags' => ['required', 'array'],
            'flags.needs_review' => ['required', 'boolean'],
            'flags.has_visual' => ['required', 'boolean'],
            'flags.low_confidence_match' => ['required', 'boolean'],
            'question_page_number' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'mark_scheme_page_number' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'admin_notes' => ['nullable', 'string'],
            'is_approved' => ['sometimes', 'boolean'],
        ];
    }
}
