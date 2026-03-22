import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { AdminPaper, AdminPaperFormValues, AdminSubjectOption } from './types'
import { paperToFormValues, toPaperPayload } from './utils'

const schema = z.object({
  subject_id: z.coerce.number().int().positive('Select or enter a subject ID.'),
  title: z.string().trim().min(3, 'Enter a clear paper title.'),
  slug: z.string().trim(),
  paper_code: z.string().trim(),
  year: z.string().trim().refine((value) => !value || (/^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 2100), 'Enter a valid year.'),
  session: z.string().trim(),
  duration_minutes: z.string().trim().refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0), 'Enter duration in minutes.'),
  total_marks: z.string().trim().refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) >= 0), 'Enter a valid total mark value.'),
  instructions: z.string(),
})

interface PaperFormProps {
  mode: 'create' | 'edit'
  paper?: AdminPaper | null
  subjectOptions?: AdminSubjectOption[]
  isSubmitting?: boolean
  onSubmit: (values: ReturnType<typeof toPaperPayload>) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
}

export function PaperForm({ mode, paper, subjectOptions = [], isSubmitting, onSubmit, onCancel, submitLabel }: PaperFormProps) {
  const form = useForm<AdminPaperFormValues>({
    resolver: zodResolver(schema),
    defaultValues: paperToFormValues(paper),
  })

  useEffect(() => {
    form.reset(paperToFormValues(paper))
  }, [form, paper])

  const watchedSubjectId = useWatch({ control: form.control, name: 'subject_id' })
  const selectedSubject = subjectOptions.find((subject) => String(subject.id) === String(watchedSubjectId || ''))

  async function handleSubmit(values: AdminPaperFormValues) {
    await onSubmit(toPaperPayload(values))
  }

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Paper fields</CardTitle>
            <CardDescription>Capture the paper metadata first so later question and rubric work stays anchored to the right subject, paper code, and mark totals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-900 text-white">{mode === 'create' ? 'Draft setup' : paper?.isPublished ? 'Published paper' : 'Draft paper'}</Badge>
                {selectedSubject ? <Badge className="bg-blue-50 text-blue-700">{selectedSubject.label}</Badge> : null}
              </div>
              <p className="text-sm text-slate-600">Use a known subject when possible to speed up repeated entry. You can still type a subject ID manually if you are creating content for a subject not seen in the current paper list.</p>
            </div>

            <FormField hint="Select from subjects already used in existing papers for faster repeated entry." id="subject_picker" label="Recent subject">
              <select
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200"
                id="subject_picker"
                onChange={(event) => {
                  form.setValue('subject_id', event.target.value ? Number(event.target.value) : 0, { shouldValidate: true })
                }}
                value={watchedSubjectId ? String(watchedSubjectId) : ''}
              >
                <option value="">Choose a recently used subject</option>
                {subjectOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </FormField>
            <FormField error={form.formState.errors.subject_id?.message} hint={selectedSubject?.helper ?? 'Manual entry is supported if the subject is not listed above.'} id="subject_id" label="Subject ID">
              <Input id="subject_id" inputMode="numeric" {...form.register('subject_id', { valueAsNumber: true })} />
            </FormField>
            <FormField error={form.formState.errors.title?.message} id="title" label="Title">
              <Input id="title" placeholder="Biology Paper 1" {...form.register('title')} />
            </FormField>
            <FormField error={form.formState.errors.slug?.message} hint="Leave blank to allow the backend to generate a unique slug." id="slug" label="Slug">
              <Input id="slug" placeholder="biology-paper-1-2025" {...form.register('slug')} />
            </FormField>
            <FormField id="paper_code" label="Paper code">
              <Input id="paper_code" placeholder="0610/12" {...form.register('paper_code')} />
            </FormField>
            <FormField error={form.formState.errors.year?.message} id="year" label="Year">
              <Input id="year" inputMode="numeric" placeholder="2025" {...form.register('year')} />
            </FormField>
            <FormField id="session" label="Session">
              <Input id="session" placeholder="May/June" {...form.register('session')} />
            </FormField>
            <FormField error={form.formState.errors.duration_minutes?.message} id="duration_minutes" label="Duration (minutes)">
              <Input id="duration_minutes" inputMode="numeric" placeholder="90" {...form.register('duration_minutes')} />
            </FormField>
            <FormField error={form.formState.errors.total_marks?.message} hint={mode === 'edit' ? 'If questions already exist, the backend will keep the paper total aligned with the summed question marks.' : 'Use the intended total if you know it; it will align automatically once questions are added.'} id="total_marks" label="Total marks">
              <Input id="total_marks" inputMode="numeric" placeholder="60" {...form.register('total_marks')} />
            </FormField>
            <div className="md:col-span-2">
              <FormField id="instructions" label="Instructions">
                <Textarea id="instructions" placeholder="Add candidate instructions, calculator rules, section notes, or timing guidance." {...form.register('instructions')} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Accuracy checklist</CardTitle>
            <CardDescription>Keep repeated entry consistent before moving into detailed question work.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Subject</p>
              <p>{selectedSubject?.label ?? paper?.subject?.name ?? 'Choose a subject or type its ID.'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Status</p>
              <p>{paper?.isPublished ? 'Published papers stay visible to students; edit with care.' : 'Draft papers can be iterated on safely before publishing.'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Workflow</p>
              <p>Paper metadata is saved independently from question and rubric editing so admins can verify each layer separately.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? <Button onClick={onCancel} type="button" variant="outline">Cancel</Button> : null}
        <Button disabled={isSubmitting || form.formState.isSubmitting} type="submit">{isSubmitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Create paper draft' : 'Save paper changes')}</Button>
      </div>
    </form>
  )
}
