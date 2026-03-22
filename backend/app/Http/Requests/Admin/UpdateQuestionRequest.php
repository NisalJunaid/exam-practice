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
            'question_number' => ['sometimes', 'string', 'max:50'],
            'question_key' => ['sometimes', 'nullable', 'string', 'max:255'],
            'question_text' => ['sometimes', 'string'],
            'reference_answer' => ['sometimes', 'string'],
            'max_marks' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'marking_guidelines' => ['sometimes', 'nullable', 'string'],
            'sample_full_mark_answer' => ['sometimes', 'nullable', 'string'],
            'order_index' => ['sometimes', 'integer', 'min:1'],
            'stem_context' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
