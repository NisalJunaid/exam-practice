<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:papers,slug'],
            'paper_code' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'session' => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'total_marks' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'instructions' => ['nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
            'source_question_paper_path' => ['nullable', 'string', 'max:2048'],
            'source_mark_scheme_path' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
