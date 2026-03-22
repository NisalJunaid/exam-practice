import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAdminQuestion, useUpdateAdminQuestion } from '@/features/admin/hooks'

const schema = z.object({
  question_number: z.string().min(1),
  question_key: z.string().optional(),
  question_text: z.string().min(3),
  reference_answer: z.string().min(1),
  max_marks: z.coerce.number().positive(),
  marking_guidelines: z.string().optional(),
  sample_full_mark_answer: z.string().optional(),
  order_index: z.coerce.number().nonnegative(),
  stem_context: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AdminEditQuestionPage() {
  const { questionId = '' } = useParams()
  const questionQuery = useAdminQuestion(questionId)
  const updateQuestion = useUpdateAdminQuestion(questionId)
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (questionQuery.data) {
      form.reset({
        question_number: questionQuery.data.questionNumber,
        question_key: questionQuery.data.questionKey ?? '',
        question_text: questionQuery.data.questionText,
        reference_answer: questionQuery.data.referenceAnswer,
        max_marks: questionQuery.data.maxMarks,
        marking_guidelines: questionQuery.data.markingGuidelines ?? '',
        sample_full_mark_answer: questionQuery.data.sampleFullMarkAnswer ?? '',
        order_index: questionQuery.data.orderIndex,
        stem_context: questionQuery.data.stemContext ?? '',
      })
    }
  }, [form, questionQuery.data])

  async function onSubmit(values: FormValues) {
    await updateQuestion.mutateAsync(values)
  }

  if (questionQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading question…</CardContent></Card>
  }

  if (!questionQuery.data) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Question not found.</CardContent></Card>
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Edit question" title={`Question ${questionQuery.data.questionNumber}`} description="Question editing has its own route so rubric work, import reconciliation, and content review can deepen without bloating the paper page." />
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField id="question_number" label="Question number"><Input id="question_number" {...form.register('question_number')} /></FormField>
            <FormField id="question_key" label="Question key"><Input id="question_key" {...form.register('question_key')} /></FormField>
            <div className="md:col-span-2"><FormField id="question_text" label="Question text"><Textarea id="question_text" {...form.register('question_text')} /></FormField></div>
            <div className="md:col-span-2"><FormField id="reference_answer" label="Reference answer"><Textarea id="reference_answer" {...form.register('reference_answer')} /></FormField></div>
            <FormField id="max_marks" label="Max marks"><Input id="max_marks" type="number" {...form.register('max_marks')} /></FormField>
            <FormField id="order_index" label="Order index"><Input id="order_index" type="number" {...form.register('order_index')} /></FormField>
            <div className="md:col-span-2"><FormField id="marking_guidelines" label="Marking guidelines"><Textarea id="marking_guidelines" {...form.register('marking_guidelines')} /></FormField></div>
            <div className="md:col-span-2"><FormField id="sample_full_mark_answer" label="Sample full-mark answer"><Textarea id="sample_full_mark_answer" {...form.register('sample_full_mark_answer')} /></FormField></div>
            <div className="md:col-span-2"><FormField id="stem_context" label="Stem context"><Textarea id="stem_context" {...form.register('stem_context')} /></FormField></div>
            <div className="md:col-span-2 flex justify-end"><Button disabled={updateQuestion.isPending} type="submit">{updateQuestion.isPending ? 'Saving…' : 'Save question'}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
