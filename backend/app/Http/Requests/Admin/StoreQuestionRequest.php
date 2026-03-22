<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'question_key' => ['sometimes', 'nullable', 'string', 'max:255'],
            'question_text' => ['required', 'string'],
            'reference_answer' => ['required', 'string'],
            'max_marks' => ['required', 'integer', 'min:1', 'max:1000'],
            'marking_guidelines' => ['nullable', 'string'],
            'sample_full_mark_answer' => ['nullable', 'string'],
            'order_index' => ['required', 'integer', 'min:1'],
            'stem_context' => ['nullable', 'string'],
            'rubric' => ['sometimes', 'array'],
            'rubric.band_descriptor' => ['sometimes', 'nullable', 'string'],
            'rubric.keywords_expected' => ['sometimes', 'nullable', 'array'],
            'rubric.keywords_expected.*' => ['string', 'max:255'],
            'rubric.common_mistakes' => ['sometimes', 'nullable', 'array'],
            'rubric.common_mistakes.*' => ['string', 'max:255'],
            'rubric.acceptable_alternatives' => ['sometimes', 'nullable', 'array'],
            'rubric.acceptable_alternatives.*' => ['string', 'max:255'],
            'rubric.marker_notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
