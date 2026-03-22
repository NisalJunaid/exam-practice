<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentImportItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'questionKey' => $this->question_key,
            'parentKey' => $this->parent_key,
            'questionNumber' => $this->question_number,
            'stemContext' => $this->stem_context,
            'questionText' => $this->question_text,
            'referenceAnswer' => $this->reference_answer,
            'markingGuidelines' => $this->marking_guidelines,
            'questionPaperMarks' => $this->question_paper_marks,
            'markSchemeMarks' => $this->mark_scheme_marks,
            'resolvedMaxMarks' => $this->resolved_max_marks,
            'matchStatus' => $this->match_status?->value,
            'pageNumber' => $this->page_number,
            'questionPageNumber' => $this->question_page_number,
            'markSchemePageNumber' => $this->mark_scheme_page_number,
            'orderIndex' => $this->order_index,
            'isApproved' => $this->is_approved,
            'adminNotes' => $this->admin_notes,
            'rawQuestionPayload' => $this->raw_question_payload ?? $this->raw_payload,
            'rawMarkSchemePayload' => $this->raw_mark_scheme_payload,
        ];
    }
}
