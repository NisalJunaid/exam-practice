<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class PaperIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_board_id' => ['nullable', 'integer', 'exists:exam_boards,id'],
            'exam_level_id' => ['nullable', 'integer', 'exists:exam_levels,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'session' => ['nullable', 'string', 'max:255'],
            'q' => ['nullable', 'string', 'max:255'],
        ];
    }
}
