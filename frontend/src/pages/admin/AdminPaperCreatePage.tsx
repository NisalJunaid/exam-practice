import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateAdminPaper } from '@/features/admin/hooks'
import { routes } from '@/lib/constants/routes'

const schema = z.object({
  subject_id: z.coerce.number().positive('Subject ID is required.'),
  title: z.string().min(3, 'Enter a paper title.'),
  slug: z.string().min(3, 'Enter a slug.'),
  paper_code: z.string().optional(),
  year: z.coerce.number().optional(),
  session: z.string().optional(),
  duration_minutes: z.coerce.number().optional(),
  total_marks: z.coerce.number().positive('Total marks must be positive.'),
  instructions: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AdminPaperCreatePage() {
  const navigate = useNavigate()
  const createPaper = useCreateAdminPaper()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject_id: 1,
      title: '',
      slug: '',
      paper_code: '',
      session: '',
      total_marks: 60,
      instructions: '',
    },
  })

  async function onSubmit(values: FormValues) {
    const paper = await createPaper.mutateAsync(values)
    navigate(routes.admin.papers.byId(paper.id))
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Create paper" title="New paper draft" description="This route demonstrates the admin form structure using React Hook Form and Zod without overcommitting to final business rules." />
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField id="subject_id" label="Subject ID" error={form.formState.errors.subject_id?.message}><Input id="subject_id" type="number" {...form.register('subject_id')} /></FormField>
            <FormField id="title" label="Title" error={form.formState.errors.title?.message}><Input id="title" {...form.register('title')} /></FormField>
            <FormField id="slug" label="Slug" error={form.formState.errors.slug?.message}><Input id="slug" {...form.register('slug')} /></FormField>
            <FormField id="paper_code" label="Paper code"><Input id="paper_code" {...form.register('paper_code')} /></FormField>
            <FormField id="year" label="Year"><Input id="year" type="number" {...form.register('year')} /></FormField>
            <FormField id="duration_minutes" label="Duration (minutes)"><Input id="duration_minutes" type="number" {...form.register('duration_minutes')} /></FormField>
            <FormField id="session" label="Session"><Input id="session" {...form.register('session')} /></FormField>
            <FormField id="total_marks" label="Total marks" error={form.formState.errors.total_marks?.message}><Input id="total_marks" type="number" {...form.register('total_marks')} /></FormField>
            <div className="md:col-span-2">
              <FormField id="instructions" label="Instructions"><Textarea id="instructions" {...form.register('instructions')} /></FormField>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button disabled={createPaper.isPending || form.formState.isSubmitting} type="submit">{createPaper.isPending ? 'Creating…' : 'Create paper'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
