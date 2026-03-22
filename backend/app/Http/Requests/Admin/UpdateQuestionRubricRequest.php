<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRubricRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'band_descriptor' => ['sometimes', 'nullable', 'string'],
            'keywords_expected' => ['sometimes', 'nullable', 'array'],
            'keywords_expected.*' => ['string', 'max:255'],
            'common_mistakes' => ['sometimes', 'nullable', 'array'],
            'common_mistakes.*' => ['string', 'max:255'],
            'acceptable_alternatives' => ['sometimes', 'nullable', 'array'],
            'acceptable_alternatives.*' => ['string', 'max:255'],
            'marker_notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
