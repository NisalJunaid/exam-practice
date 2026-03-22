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
            'questionNumber' => $this->question_number,
            'questionText' => $this->question_text,
            'referenceAnswer' => $this->reference_answer,
            'markingGuidelines' => $this->marking_guidelines,
            'questionPaperMarks' => $this->question_paper_marks,
            'markSchemeMarks' => $this->mark_scheme_marks,
            'resolvedMaxMarks' => $this->resolved_max_marks,
            'matchStatus' => $this->match_status?->value,
            'pageNumber' => $this->page_number,
            'orderIndex' => $this->order_index,
            'isApproved' => $this->is_approved,
            'adminNotes' => $this->admin_notes,
        ];
    }
}
