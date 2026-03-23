import { Copy, FileJson } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/toast/useToast'

const sampleJson = `{
  "paper": {
    "title": "Cambridge IGCSE Biology 0610/42",
    "board": "Cambridge",
    "level": "IGCSE",
    "subject": "Biology",
    "paper_code": "0610/42",
    "session": "May/June",
    "year": 2024,
    "duration_minutes": 75,
    "total_marks": 80,
    "instructions": "Answer all questions."
  },
  "questions": [
    {
      "question_key": "1(a)",
      "parent_key": null,
      "sort_order": 1,
      "question_type": "short_answer",
      "answer_interaction_type": "select_single",
      "interaction_config": {
        "options": ["carbon", "chlorine", "glucose", "iron"]
      },
      "question_text": "Which element is responsible for carrying oxygen in haemoglobin?",
      "max_marks": 1,
      "reference_answer": "iron",
      "requires_visual_reference": false,
      "visual_reference_type": null,
      "source": { "question_page": 1, "mark_scheme_page": 2 },
      "flags": { "needs_review": false, "has_visual": false, "low_confidence_match": false }
    },
    {
      "question_key": "2(c)(iv)",
      "parent_key": null,
      "sort_order": 2,
      "question_type": "diagram_label",
      "answer_interaction_type": "canvas_draw",
      "interaction_config": {
        "canvas": {
          "width": 900,
          "height": 500,
          "background_mode": "plain",
          "allow_pen": true,
          "allow_eraser": true,
          "allow_clear": true
        }
      },
      "question_text": "Draw a dot-and-cross diagram for the bonding in magnesium oxide.",
      "max_marks": 3,
      "reference_answer": "Correct transfer of electrons and bracketed ions.",
      "requires_visual_reference": false,
      "visual_reference_type": null,
      "source": { "question_page": 3, "mark_scheme_page": 6 },
      "flags": { "needs_review": true, "has_visual": false, "low_confidence_match": false }
    },
    {
      "question_key": "2(d)(ii)",
      "parent_key": "2",
      "sort_order": 3,
      "question_type": "diagram_label",
      "answer_interaction_type": "diagram_annotation",
      "interaction_config": {
        "base_image_required": true,
        "canvas_overlay": true,
        "allow_text_labels": true
      },
      "question_text": "Annotate the pathway diagram to show the missing stages.",
      "max_marks": 2,
      "reference_answer": "Correct labels placed on the supplied visual.",
      "requires_visual_reference": true,
      "visual_reference_type": "diagram",
      "visual_reference_note": "Requires the original labelled pathway diagram.",
      "source": { "question_page": 4, "mark_scheme_page": 7 },
      "flags": { "needs_review": false, "has_visual": true, "low_confidence_match": false }
    },
    {
      "question_key": "3(a)",
      "parent_key": "3",
      "sort_order": 4,
      "question_type": "calculation",
      "answer_interaction_type": "calculation_with_working",
      "interaction_config": {
        "final_answer_label": "Final Answer",
        "working_label": "Working",
        "allow_units": true
      },
      "question_text": "Calculate the concentration of the acid and show your working.",
      "max_marks": 4,
      "reference_answer": "0.080 dm3 with clear working.",
      "requires_visual_reference": false,
      "visual_reference_type": null,
      "source": { "question_page": 5, "mark_scheme_page": 9 },
      "flags": { "needs_review": false, "has_visual": false, "low_confidence_match": false }
    }
  ]
}`

const guidance = [
  ['question_type', 'Keep the academic taxonomy separate from the answer UI so import review can distinguish pedagogy from rendering.'],
  ['answer_interaction_type', 'Declare the student-facing interaction such as multi_field, table_input, canvas_draw, or diagram_annotation.'],
  ['interaction_config', 'Include the render metadata needed by the frontend, including options, fields, table rows, and canvas settings.'],
  ['requires_visual_reference', 'Use this together with visual_reference_type when the student must annotate or work from a supplied visual.'],
] as const

export function ImportJsonSampleCard() {
  const { toast } = useToast()

  async function handleCopy() {
    await navigator.clipboard.writeText(sampleJson)
    toast({ title: 'Sample JSON copied', description: 'You can now adapt the example into your canonical import payload.', variant: 'success' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Canonical JSON sample</CardTitle>
            <CardDescription>Use this as a guide for the expanded interaction-aware schema. This sample is reference-only and does not become the submitted import payload.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => void handleCopy()}>
            <Copy className="size-4" />
            Copy sample
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
          <pre className="overflow-x-auto whitespace-pre-wrap break-words">{sampleJson}</pre>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {guidance.map(([label, description]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                <FileJson className="size-4 text-slate-500" />
                {label}
              </div>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
