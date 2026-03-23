<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentImportItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $flags = $this->flags ?? [];
        $visualCount = $this->whenLoaded('visualAssets', fn () => $this->visualAssets->count(), $this->visualAssets()->count());

        return [
            'id' => $this->id,
            'questionKey' => $this->question_key,
            'parentKey' => $this->parent_key,
            'questionNumber' => $this->question_number,
            'questionType' => $this->question_type?->value ?? $this->question_type,
            'answerInteractionType' => $this->answer_interaction_type?->value ?? $this->answer_interaction_type,
            'interactionConfig' => $this->interaction_config ?? [],
            'stemContext' => $this->stem_context,
            'questionText' => $this->question_text,
            'referenceAnswer' => $this->reference_answer,
            'markingGuidelines' => $this->marking_guidelines,
            'sampleFullMarkAnswer' => $this->sample_full_mark_answer,
            'questionPaperMarks' => $this->question_paper_marks,
            'markSchemeMarks' => $this->mark_scheme_marks,
            'resolvedMaxMarks' => $this->resolved_max_marks,
            'reviewStatus' => $this->match_status?->value ?? $this->match_status,
            'matchStatus' => $this->match_status?->value ?? $this->match_status,
            'requiresVisualReference' => $this->requires_visual_reference,
            'visualReferenceType' => $this->visual_reference_type?->value ?? $this->visual_reference_type,
            'visualReferenceNote' => $this->visual_reference_note,
            'hasVisual' => $this->has_visual,
            'flags' => [
                'needsReview' => (bool) ($flags['needs_review'] ?? false),
                'hasVisual' => (bool) ($flags['has_visual'] ?? $this->has_visual),
                'lowConfidenceMatch' => (bool) ($flags['low_confidence_match'] ?? false),
            ],
            'pageNumber' => $this->page_number,
            'questionPageNumber' => $this->question_page_number,
            'markSchemePageNumber' => $this->mark_scheme_page_number,
            'orderIndex' => $this->order_index,
            'isApproved' => $this->is_approved,
            'adminNotes' => $this->admin_notes,
            'visualCount' => $visualCount,
            'visualAssets' => QuestionVisualAssetResource::collection($this->whenLoaded('visualAssets')),
            'rawQuestionPayload' => $this->raw_question_payload ?? $this->raw_payload,
            'rawMarkSchemePayload' => $this->raw_mark_scheme_payload,
        ];
    }
}
