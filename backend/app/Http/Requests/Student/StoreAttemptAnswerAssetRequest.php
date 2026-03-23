<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttemptAnswerAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_question_id' => ['required', 'integer', 'exists:paper_questions,id'],
            'asset_type' => ['required', 'string', 'max:50'],
            'file' => ['required', 'file', 'max:10240', 'mimetypes:image/png,image/jpeg,image/webp,image/gif'],
            'metadata' => ['sometimes'],
        ];
    }
}
