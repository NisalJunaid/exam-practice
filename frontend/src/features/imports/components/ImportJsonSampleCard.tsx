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
      "question_text": "State two observable features of a healthy leaf.",
      "max_marks": 2,
      "reference_answer": "Green colour and broad surface area.",
      "requires_visual_reference": false,
      "visual_reference_type": null,
      "source": { "question_page": 1, "mark_scheme_page": 2 },
      "flags": { "needs_review": false, "has_visual": false, "low_confidence_match": false }
    },
    {
      "question_key": "2(a)",
      "parent_key": null,
      "sort_order": 2,
      "question_type": "diagram_label",
      "question_text": "Label the nucleus and the cell membrane on the diagram.",
      "max_marks": 2,
      "reference_answer": "Nucleus; cell membrane.",
      "requires_visual_reference": true,
      "visual_reference_type": "diagram",
      "visual_reference_note": "Requires the original labelled cell diagram.",
      "source": { "question_page": 3, "mark_scheme_page": 6 },
      "flags": { "needs_review": true, "has_visual": true, "low_confidence_match": false }
    },
    {
      "question_key": "2(b)",
      "parent_key": "2",
      "sort_order": 3,
      "question_type": "table",
      "question_text": "Complete the table to compare plant and animal cells.",
      "max_marks": 3,
      "reference_answer": "Plant cells have a cell wall and chloroplasts; animal cells do not.",
      "requires_visual_reference": false,
      "visual_reference_type": null,
      "source": { "question_page": 4, "mark_scheme_page": 7 },
      "flags": { "needs_review": false, "has_visual": false, "low_confidence_match": false }
    },
    {
      "question_key": "3(a)",
      "parent_key": "3",
      "sort_order": 4,
      "question_type": "multiple_part",
      "stem_context": "Investigate how temperature affects enzyme activity.",
      "question_text": "Explain the effect of temperature on enzyme activity.",
      "max_marks": 4,
      "reference_answer": "Activity increases to an optimum, then decreases due to denaturation.",
      "requires_visual_reference": false,
      "visual_reference_type": null,
      "source": { "question_page": 5, "mark_scheme_page": 9 },
      "flags": { "needs_review": false, "has_visual": false, "low_confidence_match": false }
    }
  ]
}`

const guidance = [
  ['short_answer', 'Simple text-only question with marks and reference answer.'],
  ['diagram_label', 'Image-dependent question. Set requires_visual_reference=true and add a visual_reference_type.'],
  ['table', 'Structured table completion question with standard source page references.'],
  ['multiple_part', 'Use parent_key and stem_context to preserve grouped parts.'],
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
            <CardDescription>Use this as a guide for the expected schema. This sample is reference-only and does not become the submitted import payload.</CardDescription>
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
