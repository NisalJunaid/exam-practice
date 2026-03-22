import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateImport, useImports } from '@/features/imports/hooks'
import { routes } from '@/lib/constants/routes'

const schema = z.object({
  question_paper: z.instanceof(File, { message: 'Upload the question paper PDF.' }),
  mark_scheme: z.instanceof(File, { message: 'Upload the mark scheme PDF.' }),
})

type FormValues = z.infer<typeof schema>

export function AdminImportPaperPage() {
  const navigate = useNavigate()
  const importsQuery = useImports()
  const createImport = useCreateImport()
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const data = new FormData()
    data.append('question_paper', values.question_paper)
    data.append('mark_scheme', values.mark_scheme)

    const created = await createImport.mutateAsync(data)
    navigate(routes.admin.imports.byId(created.id))
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Import paper" title="Upload paper + mark scheme" description="The import upload route uses RHF + Zod, while the list beneath shows prior imports for rapid review handoff." />
      <Card>
        <CardHeader><CardTitle>Upload source files</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField id="question_paper" label="Question paper PDF" error={form.formState.errors.question_paper?.message}>
              <Input id="question_paper" type="file" accept="application/pdf" onChange={(event) => form.setValue('question_paper', event.target.files?.[0] as File)} />
            </FormField>
            <FormField id="mark_scheme" label="Mark scheme PDF" error={form.formState.errors.mark_scheme?.message}>
              <Input id="mark_scheme" type="file" accept="application/pdf" onChange={(event) => form.setValue('mark_scheme', event.target.files?.[0] as File)} />
            </FormField>
            <div className="md:col-span-2 flex justify-end">
              <Button disabled={createImport.isPending} type="submit">{createImport.isPending ? 'Uploading…' : 'Create import job'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent imports</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {importsQuery.data?.map((item) => (
            <button key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left text-sm hover:bg-slate-50" onClick={() => navigate(routes.admin.imports.byId(item.id))} type="button">
              <div>
                <p className="font-medium text-slate-900">Import #{item.id}</p>
                <p className="text-slate-500">{item.questionPaperName ?? 'Unnamed question paper'} · {item.markSchemeName ?? 'Unnamed mark scheme'}</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{item.status}</div>
            </button>
          )) ?? <p className="text-sm text-slate-600">No imports yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
