<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttemptAnswersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.paper_question_id' => ['required', 'integer', 'distinct', 'exists:paper_questions,id'],
            'answers.*.student_answer' => ['nullable', 'string'],
        ];
    }
}
