<?php

namespace App\Http\Requests\Admin;

use App\Enums\AnswerInteractionType;
use App\Enums\QuestionType;
use App\Enums\VisualReferenceType;
use App\Support\AnswerInteractions\AnswerInteractionSchema;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'question_key' => ['sometimes', 'nullable', 'string', 'max:255'],
            'question_type' => ['sometimes', Rule::in(array_column(QuestionType::cases(), 'value'))],
            'answer_interaction_type' => ['sometimes', Rule::in(array_column(AnswerInteractionType::cases(), 'value'))],
            'interaction_config' => ['sometimes', 'array'],
            'question_text' => ['required', 'string'],
            'reference_answer' => ['required', 'string'],
            'max_marks' => ['required', 'integer', 'min:1', 'max:1000'],
            'marking_guidelines' => ['nullable', 'string'],
            'sample_full_mark_answer' => ['nullable', 'string'],
            'order_index' => ['required', 'integer', 'min:1'],
            'stem_context' => ['nullable', 'string'],
            'requires_visual_reference' => ['sometimes', 'boolean'],
            'visual_reference_type' => ['nullable', Rule::in(array_column(VisualReferenceType::cases(), 'value'))],
            'visual_reference_note' => ['nullable', 'string'],
            'visual_assets' => ['sometimes', 'array'],
            'visual_assets.*.id' => ['required_with:visual_assets', 'integer', 'exists:question_visual_assets,id'],
            'visual_assets.*.alt_text' => ['sometimes', 'nullable', 'string', 'max:255'],
            'visual_assets.*.caption' => ['sometimes', 'nullable', 'string', 'max:255'],
            'visual_assets.*.sort_order' => ['sometimes', 'integer', 'min:1'],
            'visual_assets.*.is_deleted' => ['sometimes', 'boolean'],
            'rubric' => ['sometimes', 'array'],
            'rubric.band_descriptor' => ['sometimes', 'nullable', 'string'],
            'rubric.keywords_expected' => ['sometimes', 'nullable', 'array'],
            'rubric.keywords_expected.*' => ['string', 'max:255'],
            'rubric.common_mistakes' => ['sometimes', 'nullable', 'array'],
            'rubric.common_mistakes.*' => ['string', 'max:255'],
            'rubric.acceptable_alternatives' => ['sometimes', 'nullable', 'array'],
            'rubric.acceptable_alternatives.*' => ['string', 'max:255'],
            'rubric.marker_notes' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $requiresVisual = (bool) $this->boolean('requires_visual_reference');
            $normalized = app(AnswerInteractionSchema::class)->normalize(
                (string) ($this->input('question_type') ?? QuestionType::ShortAnswer->value),
                $this->input('answer_interaction_type'),
                $this->input('interaction_config'),
                $requiresVisual,
            );
            $this->merge($normalized);
        });
    }
}
