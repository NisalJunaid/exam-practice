<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_paper' => ['required', 'file', 'mimes:pdf,txt', 'max:10240'],
            'mark_scheme' => ['required', 'file', 'mimes:pdf,txt', 'max:10240'],
        ];
    }
}
