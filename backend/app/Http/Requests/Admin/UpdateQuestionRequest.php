<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
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
            'question_text' => ['sometimes', 'string'],
            'reference_answer' => ['sometimes', 'string'],
            'max_marks' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'marking_guidelines' => ['sometimes', 'nullable', 'string'],
            'sample_full_mark_answer' => ['sometimes', 'nullable', 'string'],
            'order_index' => ['sometimes', 'integer', 'min:1'],
            'stem_context' => ['sometimes', 'nullable', 'string'],
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
