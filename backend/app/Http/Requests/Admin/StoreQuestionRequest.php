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
            'question_number' => ['required', 'string', 'max:50'],
            'question_key' => ['nullable', 'string', 'max:255'],
            'question_text' => ['required', 'string'],
            'reference_answer' => ['required', 'string'],
            'max_marks' => ['required', 'integer', 'min:1', 'max:1000'],
            'marking_guidelines' => ['nullable', 'string'],
            'sample_full_mark_answer' => ['nullable', 'string'],
            'order_index' => ['required', 'integer', 'min:1'],
            'stem_context' => ['nullable', 'string'],
        ];
    }
}
