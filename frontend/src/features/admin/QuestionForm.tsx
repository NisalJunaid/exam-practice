import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { QuestionVisualPanel } from '@/components/questions/QuestionVisualPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AnswerInteractionRenderer } from '@/features/attempts/components/AnswerInteractionRenderer'
import type { AttemptAnswerDraft, AttemptQuestion } from '@/features/attempts/types'

import type { AdminQuestion, AdminQuestionFormValues, AdminRubricFormValues } from './types'
import { questionToFormValues, toQuestionPayload } from './utils'

const schema = z.object({
  question_number: z.string().trim(),
  question_key: z.string().trim(),
  question_type: z.string().trim(),
  answer_interaction_type: z.string().trim(),
  interaction_config: z.string().trim().refine((value) => {
    try {
      JSON.parse(value || '{}')
      return true
    } catch {
      return false
    }
  }, 'Interaction config must be valid JSON.'),
  question_text: z.string().trim().min(3, 'Enter the question wording.'),
  reference_answer: z.string().trim().min(1, 'Enter the reference answer or mark scheme answer block.'),
  max_marks: z.string().trim().refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, 'Max marks must be at least 1.'),
  marking_guidelines: z.string(),
  sample_full_mark_answer: z.string(),
  order_index: z.string().trim().refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, 'Order index must be at least 1.'),
  stem_context: z.string(),
  requires_visual_reference: z.boolean(),
  visual_reference_type: z.string(),
  visual_reference_note: z.string(),
})

interface QuestionFormProps {
  mode: 'create' | 'edit'
  question?: AdminQuestion | null
  defaultValues?: AdminQuestionFormValues
  paperTitle?: string
  includeRubricHint?: boolean
  isSubmitting?: boolean
  onSubmit: (values: ReturnType<typeof toQuestionPayload>) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  rubricValues?: AdminRubricFormValues
}

const questionTypes = ['short_answer', 'structured', 'table', 'diagram_label', 'calculation', 'multiple_part', 'essay', 'other']
const interactionTypes = ['short_text', 'long_text', 'select_single', 'select_multiple', 'multi_field', 'table_input', 'calculation_with_working', 'canvas_draw', 'graph_plot', 'image_upload', 'canvas_plus_text', 'diagram_annotation', 'matching', 'mcq_single', 'mcq_multiple', 'other']
const visualTypes = ['', 'diagram', 'table', 'graph', 'chemical_structure', 'image', 'mixed']

export function QuestionForm({ mode, question, defaultValues, paperTitle, includeRubricHint, isSubmitting, onSubmit, onCancel, submitLabel, rubricValues }: QuestionFormProps) {
  const form = useForm<AdminQuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? questionToFormValues(question),
  })

  useEffect(() => {
    form.reset(defaultValues ?? questionToFormValues(question))
  }, [defaultValues, form, question])

  async function handleSubmit(values: AdminQuestionFormValues) {
    await onSubmit(toQuestionPayload(values, rubricValues))
  }

  const previewValues = useWatch({ control: form.control })
  let previewConfig: Record<string, unknown> = {}
  try {
    previewConfig = JSON.parse(previewValues.interaction_config || '{}') as Record<string, unknown>
  } catch {
    previewConfig = {}
  }

  const previewQuestion: AttemptQuestion = {
    id: question?.id ?? 0,
    answerId: null,
    questionNumber: previewValues.question_number || question?.questionNumber || '1',
    questionKey: previewValues.question_key || question?.questionKey || null,
    questionText: previewValues.question_text || question?.questionText || 'Preview the renderer here.',
    questionType: previewValues.question_type,
    answerInteractionType: previewValues.answer_interaction_type,
    interactionConfig: previewConfig,
    stemContext: previewValues.stem_context || question?.stemContext || null,
    maxMarks: Number(previewValues.max_marks || question?.maxMarks || 1),
    requiresVisualReference: previewValues.requires_visual_reference,
    visualReferenceType: previewValues.visual_reference_type || null,
    visualReferenceNote: previewValues.visual_reference_note || null,
    hasVisual: Boolean(question?.visualAssets.length),
    visualAssets: question?.visualAssets ?? [],
    studentAnswer: null,
    structuredAnswer: null,
    answerAssets: [],
    isBlank: true,
    submittedAt: null,
    updatedAt: question?.updatedAt ?? null,
  }
  const previewDraft: AttemptAnswerDraft = { studentAnswer: '', structuredAnswer: null }

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Question fields</CardTitle>
            <CardDescription>Keep wording, numbering, answer interaction, and scoring aligned before moving into rubric calibration.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Badge className="bg-violet-50 text-violet-700">{mode === 'create' ? 'New question' : `Question ${question?.questionNumber ?? 'draft'}`}</Badge>
              {paperTitle ? <Badge className="bg-slate-100 text-slate-700">{paperTitle}</Badge> : null}
              <Badge className="bg-slate-100 text-slate-700">Question data only</Badge>
            </div>
            <FormField hint="Leave this blank to let the backend infer it from the key or order index." id="question_number" label="Question number">
              <Input id="question_number" placeholder="1" {...form.register('question_number')} />
            </FormField>
            <FormField hint="Use structured keys like 2(c)(iv) when the mark scheme uses sub-parts." id="question_key" label="Question key">
              <Input id="question_key" placeholder="1(a)" {...form.register('question_key')} />
            </FormField>
            <FormField id="question_type" label="Question type">
              <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" {...form.register('question_type')}>
                {questionTypes.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
              </select>
            </FormField>
            <FormField id="answer_interaction_type" label="Answer interaction type">
              <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" {...form.register('answer_interaction_type')}>
                {interactionTypes.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
              </select>
            </FormField>
            <FormField error={form.formState.errors.order_index?.message} hint="Must be unique inside the paper." id="order_index" label="Order index">
              <Input id="order_index" inputMode="numeric" placeholder="1" {...form.register('order_index')} />
            </FormField>
            <FormField error={form.formState.errors.max_marks?.message} id="max_marks" label="Max marks">
              <Input id="max_marks" inputMode="numeric" placeholder="4" {...form.register('max_marks')} />
            </FormField>
            <div className="md:col-span-2">
              <FormField error={form.formState.errors.interaction_config?.message} hint="Raw JSON fallback for advanced configs like canvas, graph axes, table rows, and multi-field layouts." id="interaction_config" label="Interaction config JSON">
                <Textarea className="min-h-[12rem] font-mono text-xs" id="interaction_config" {...form.register('interaction_config')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField error={form.formState.errors.question_text?.message} id="question_text" label="Question text">
                <Textarea id="question_text" placeholder="Paste the exact wording students will answer." {...form.register('question_text')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField error={form.formState.errors.reference_answer?.message} hint="Store the clean reference answer or mark scheme answer block the AI should score against later." id="reference_answer" label="Reference answer">
                <Textarea id="reference_answer" placeholder="Add the official answer or examiner points." {...form.register('reference_answer')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField id="marking_guidelines" label="Marking guidelines">
                <Textarea id="marking_guidelines" placeholder="Add step-specific rules, accepted points, or examiner notes." {...form.register('marking_guidelines')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField id="sample_full_mark_answer" label="Sample full-mark answer">
                <Textarea id="sample_full_mark_answer" placeholder="Optional model answer for longer responses." {...form.register('sample_full_mark_answer')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField hint="Use this for parent stem text that applies to a sub-question." id="stem_context" label="Stem context">
                <Textarea id="stem_context" placeholder="Shared prompt context for nested parts." {...form.register('stem_context')} />
              </FormField>
            </div>
            <div className="md:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
                <input type="checkbox" {...form.register('requires_visual_reference')} />
                Requires visual reference
              </label>
              <FormField id="visual_reference_type" label="Visual reference type">
                <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" {...form.register('visual_reference_type')}>
                  {visualTypes.map((type) => <option key={type} value={type}>{type ? type.replaceAll('_', ' ') : 'None'}</option>)}
                </select>
              </FormField>
              <div className="md:col-span-2">
                <FormField id="visual_reference_note" label="Visual reference note">
                  <Textarea id="visual_reference_note" placeholder="Explain which reference visual the student needs." {...form.register('visual_reference_note')} />
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Question quality checks</CardTitle>
            <CardDescription>These checks reduce authoring mistakes during repeated entry.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Interaction-aware rendering</p>
              <p>Store both the academic question type and answer interaction type so attempt rendering can switch between text, tables, calculations, and canvas tools.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Live renderer preview</p>
              <p className="mb-3">This preview uses the currently selected answer interaction type and interaction config.</p>
              <div className="space-y-4">
                {previewQuestion.visualAssets.length ? <QuestionVisualPanel compact visuals={previewQuestion.visualAssets} /> : null}
                <AnswerInteractionRenderer
                  draft={previewDraft}
                  editable={false}
                  onChange={() => undefined}
                  onUploadAsset={async () => { throw new Error('Preview uploads are disabled.') }}
                  question={previewQuestion}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Question keys</p>
              <p>Use keys only when they improve traceability to imported mark schemes or official numbering.</p>
            </div>
            {includeRubricHint ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                <p className="font-medium">Rubric support included</p>
                <p className="mt-1">If you fill rubric fields in the same flow, they will be nested into the create-question payload that the backend already accepts.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? <Button onClick={onCancel} type="button" variant="outline">Cancel</Button> : null}
        <Button disabled={isSubmitting || form.formState.isSubmitting} type="submit">{isSubmitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Create question' : 'Save question')}</Button>
      </div>
    </form>
  )
}
