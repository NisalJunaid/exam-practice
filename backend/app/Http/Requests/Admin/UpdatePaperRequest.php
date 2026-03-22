<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $paperId = $this->route('paper')?->id;

        return [
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('papers', 'slug')->ignore($paperId)],
            'paper_code' => ['sometimes', 'nullable', 'string', 'max:255'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:2100'],
            'session' => ['sometimes', 'nullable', 'string', 'max:100'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1440'],
            'total_marks' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:1000'],
            'instructions' => ['sometimes', 'nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
            'source_question_paper_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'source_mark_scheme_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
        ];
    }
}
