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
            'json_file' => ['nullable', 'file', 'mimetypes:application/json,text/plain', 'max:5120'],
            'raw_json' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [function ($validator) {
            $hasFile = $this->hasFile('json_file');
            $hasRawJson = filled($this->input('raw_json'));

            if (! $hasFile && ! $hasRawJson) {
                $validator->errors()->add('json_file', 'Upload a JSON file or paste canonical JSON.');
            }
        }];
    }
}
