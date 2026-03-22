import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAdminPaper, usePublishPaper, useUpdateAdminPaper } from '@/features/admin/hooks'

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  paper_code: z.string().optional(),
  session: z.string().optional(),
  total_marks: z.coerce.number().positive(),
  instructions: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AdminEditPaperPage() {
  const { paperId = '' } = useParams()
  const paperQuery = useAdminPaper(paperId)
  const updatePaper = useUpdateAdminPaper(paperId)
  const publishPaper = usePublishPaper(paperId)
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (paperQuery.data) {
      form.reset({
        title: paperQuery.data.title,
        slug: paperQuery.data.slug,
        paper_code: paperQuery.data.paperCode ?? '',
        session: paperQuery.data.session ?? '',
        total_marks: paperQuery.data.totalMarks,
        instructions: paperQuery.data.instructions ?? '',
      })
    }
  }, [form, paperQuery.data])

  async function onSubmit(values: FormValues) {
    await updatePaper.mutateAsync(values)
  }

  if (paperQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading paper…</CardContent></Card>
  }

  if (!paperQuery.data) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Paper not found.</CardContent></Card>
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Edit paper" title={paperQuery.data.title} description="The paper edit route keeps metadata maintenance separate from question-level editing and import review." actions={<Button variant="outline" onClick={() => void publishPaper.mutateAsync()}>{publishPaper.isPending ? 'Publishing…' : 'Publish paper'}</Button>} />
      <Card>
        <CardHeader><CardTitle>Paper metadata</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField id="title" label="Title"><Input id="title" {...form.register('title')} /></FormField>
            <FormField id="slug" label="Slug"><Input id="slug" {...form.register('slug')} /></FormField>
            <FormField id="paper_code" label="Paper code"><Input id="paper_code" {...form.register('paper_code')} /></FormField>
            <FormField id="session" label="Session"><Input id="session" {...form.register('session')} /></FormField>
            <FormField id="total_marks" label="Total marks"><Input id="total_marks" type="number" {...form.register('total_marks')} /></FormField>
            <div className="md:col-span-2"><FormField id="instructions" label="Instructions"><Textarea id="instructions" {...form.register('instructions')} /></FormField></div>
            <div className="md:col-span-2 flex justify-end"><Button disabled={updatePaper.isPending} type="submit">{updatePaper.isPending ? 'Saving…' : 'Save changes'}</Button></div>
          </form>
        </CardContent>
      </Card>
      {paperQuery.data.questions?.length ? (
        <Card>
          <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {paperQuery.data.questions.map((question) => (
              <div key={question.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                <p className="font-medium text-slate-900">Question {question.questionNumber}</p>
                <p className="text-slate-600">{question.questionText}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
