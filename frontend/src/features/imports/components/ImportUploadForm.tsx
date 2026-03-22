import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, LoaderCircle, UploadCloud } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const uploadSchema = z.object({
  question_paper: z.instanceof(File, { message: 'Upload the question paper PDF.' }),
  mark_scheme: z.instanceof(File, { message: 'Upload the mark scheme PDF.' }),
})

type UploadFormValues = z.infer<typeof uploadSchema>

interface ImportUploadFormProps {
  isSubmitting: boolean
  onSubmit: (formData: FormData) => Promise<void>
}

export function ImportUploadForm({ isSubmitting, onSubmit }: ImportUploadFormProps) {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  })

  const questionPaper = useWatch({ control: form.control, name: 'question_paper' })
  const markScheme = useWatch({ control: form.control, name: 'mark_scheme' })

  async function handleSubmit(values: UploadFormValues) {
    const formData = new FormData()
    formData.append('question_paper', values.question_paper)
    formData.append('mark_scheme', values.mark_scheme)

    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Upload source PDFs</CardTitle>
            <CardDescription>Start the extraction job with both the question paper and the mark scheme so the review step can compare them side by side.</CardDescription>
          </div>
          <BadgeIcon />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50 text-blue-900">
          <UploadCloud className="mb-2 size-4" />
          <AlertTitle>Review happens before any paper is created.</AlertTitle>
          <AlertDescription>
            Uploaded files only create a draft import. Extracted questions stay editable and unconfirmed until an admin explicitly approves the import.
          </AlertDescription>
        </Alert>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField id="question_paper" label="Question paper PDF" error={form.formState.errors.question_paper?.message} hint="Accepted format: PDF only.">
            <Input
              id="question_paper"
              type="file"
              accept="application/pdf"
              onChange={(event) => form.setValue('question_paper', event.target.files?.[0] as File, { shouldValidate: true })}
            />
          </FormField>
          <FormField id="mark_scheme" label="Mark scheme PDF" error={form.formState.errors.mark_scheme?.message} hint="Accepted format: PDF only.">
            <Input
              id="mark_scheme"
              type="file"
              accept="application/pdf"
              onChange={(event) => form.setValue('mark_scheme', event.target.files?.[0] as File, { shouldValidate: true })}
            />
          </FormField>

          <div className="md:col-span-2 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
            <FileSummary label="Question paper" file={questionPaper} />
            <FileSummary label="Mark scheme" file={markScheme} />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3">
            <Button disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              {isSubmitting ? 'Uploading and creating draft…' : 'Create import draft'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function FileSummary({ label, file }: { label: string; file?: File }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <FileText className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="truncate text-xs text-slate-500">{file ? `${file.name} · ${formatBytes(file.size)}` : 'No file selected yet.'}</p>
      </div>
    </div>
  )
}

function BadgeIcon() {
  return (
    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
      <FileText className="size-5" />
    </div>
  )
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
