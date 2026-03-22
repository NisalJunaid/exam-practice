import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { AdminQuestion, AdminQuestionFormValues, AdminRubricFormValues } from './types'
import { questionToFormValues, toQuestionPayload } from './utils'

const schema = z.object({
  question_number: z.string().trim(),
  question_key: z.string().trim(),
  question_text: z.string().trim().min(3, 'Enter the question wording.'),
  reference_answer: z.string().trim().min(1, 'Enter the reference answer or mark scheme answer block.'),
  max_marks: z.string().trim().refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, 'Max marks must be at least 1.'),
  marking_guidelines: z.string(),
  sample_full_mark_answer: z.string(),
  order_index: z.string().trim().refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, 'Order index must be at least 1.'),
  stem_context: z.string(),
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

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Question fields</CardTitle>
            <CardDescription>Keep wording, numbering, and scoring aligned before moving into rubric calibration.</CardDescription>
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
            <FormField error={form.formState.errors.order_index?.message} hint="Must be unique inside the paper." id="order_index" label="Order index">
              <Input id="order_index" inputMode="numeric" placeholder="1" {...form.register('order_index')} />
            </FormField>
            <FormField error={form.formState.errors.max_marks?.message} id="max_marks" label="Max marks">
              <Input id="max_marks" inputMode="numeric" placeholder="4" {...form.register('max_marks')} />
            </FormField>
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
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Question quality checks</CardTitle>
            <CardDescription>These checks reduce authoring mistakes during repeated entry.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Marking basis</p>
              <p>Every question needs a reference answer and a unique order index before it can be used accurately downstream.</p>
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
