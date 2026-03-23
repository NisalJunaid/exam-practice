import { zodResolver } from '@hookform/resolvers/zod'
import { FileJson, LoaderCircle, UploadCloud } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const uploadSchema = z.object({
  json_file: z.instanceof(File).optional(),
  raw_json: z.string().optional(),
}).superRefine((value, context) => {
  const hasFile = value.json_file instanceof File
  const hasRawJson = Boolean(value.raw_json?.trim())

  if (!hasFile && !hasRawJson) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['json_file'], message: 'Upload a JSON file or paste canonical JSON.' })
  }
})

type UploadFormValues = z.infer<typeof uploadSchema>

interface ImportUploadFormProps {
  isSubmitting: boolean
  onSubmit: (formData: FormData) => Promise<void>
}

export function ImportUploadForm({ isSubmitting, onSubmit }: ImportUploadFormProps) {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { raw_json: '' },
  })

  const jsonFile = useWatch({ control: form.control, name: 'json_file' })
  const rawJson = useWatch({ control: form.control, name: 'raw_json' })

  async function handleSubmit(values: UploadFormValues) {
    const formData = new FormData()
    if (values.json_file) formData.append('json_file', values.json_file)
    if (values.raw_json?.trim()) formData.append('raw_json', values.raw_json)
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Import canonical JSON</CardTitle>
            <CardDescription>Upload one canonical paper JSON file or paste the payload directly. The app validates the schema and creates a draft-only review record.</CardDescription>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <FileJson className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50 text-blue-900">
          <UploadCloud className="mb-2 size-4" />
          <AlertTitle>Draft-only import pipeline</AlertTitle>
          <AlertDescription>
            Validation, preview, edits, and reference-image uploads all happen before any live paper or question record is created.
          </AlertDescription>
        </Alert>

        <form className="grid gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField id="json_file" label="JSON file upload" error={form.formState.errors.json_file?.message} hint="Optional if you prefer to paste the payload below.">
              <Input
                id="json_file"
                type="file"
                accept="application/json,text/plain"
                onChange={(event) => form.setValue('json_file', event.target.files?.[0], { shouldValidate: true })}
              />
            </FormField>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Current upload selection</p>
              <p className="mt-2">{jsonFile ? `${jsonFile.name} · ${formatBytes(jsonFile.size)}` : 'No file selected.'}</p>
              <p className="mt-3 text-xs text-slate-500">If a file is selected and JSON is also pasted, the file is used as the canonical source.</p>
            </div>
          </div>

          <FormField id="raw_json" label="Paste canonical JSON" error={form.formState.errors.raw_json?.message} hint="Use this if the extraction workflow provides JSON text directly.">
            <Textarea
              id="raw_json"
              className="min-h-[280px] font-mono text-xs"
              placeholder="Paste the canonical paper JSON here…"
              value={rawJson ?? ''}
              onChange={(event) => form.setValue('raw_json', event.target.value, { shouldValidate: true })}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3">
            <Button disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              {isSubmitting ? 'Validating and creating draft…' : 'Create JSON import draft'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
