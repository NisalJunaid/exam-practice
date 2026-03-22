import { ArrowRight, FileSearch } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateImport, useImports } from '@/features/imports/hooks'
import { getCounts, getImportStatusTone } from '@/features/imports/utils'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

import { ImportUploadForm } from '../components/ImportUploadForm'

export function AdminImportPaperPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const importsQuery = useImports()
  const createImport = useCreateImport()

  async function handleSubmit(formData: FormData) {
    try {
      const created = await createImport.mutateAsync(formData)
      toast({
        title: 'Import draft created',
        description: 'The PDFs are uploaded and extraction has started. Review the draft before confirming the paper import.',
        variant: 'success',
      })
      navigate(routes.admin.imports.byId(created.id))
    } catch (error) {
      toast({
        title: 'Could not create import draft',
        description: error instanceof Error ? error.message : 'Check the files and try again.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin imports"
        title="Upload paper + mark scheme"
        description="Create a draft import from source PDFs, let extraction finish, then review every extracted row before publishing the paper into the admin paper inventory."
      />

      <ImportUploadForm isSubmitting={createImport.isPending} onSubmit={handleSubmit} />

      <Card>
        <CardHeader>
          <CardTitle>Recent import drafts</CardTitle>
          <CardDescription>Jump back into in-progress reviews or reopen completed imports to trace how a paper was generated.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {importsQuery.isLoading ? (
            <p className="text-sm text-slate-600">Loading import drafts…</p>
          ) : importsQuery.isError ? (
            <EmptyState
              title="Could not load import drafts"
              description={importsQuery.error instanceof Error ? importsQuery.error.message : 'Try again to reload recent imports.'}
              action={<Button type="button" variant="outline" onClick={() => void importsQuery.refetch()}>Retry</Button>}
            />
          ) : importsQuery.data?.length ? (
            importsQuery.data.map((item) => {
              const counts = getCounts(item.summary, item.items ?? [])

              return (
                <button
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  onClick={() => navigate(routes.admin.imports.byId(item.id))}
                  type="button"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">Import #{item.id}</p>
                      <Badge className={getImportStatusTone(item.status)}>{item.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{item.questionPaperName ?? 'Unnamed question paper'} • {item.markSchemeName ?? 'Unnamed mark scheme'}</p>
                    <p className="text-xs text-slate-500">{counts.total} rows • {counts.matched} matched • {counts.ambiguous} ambiguous • {counts.unmatched} unmatched</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    Review import
                    <ArrowRight className="size-4" />
                  </div>
                </button>
              )
            })
          ) : (
            <EmptyState
              title="No import drafts yet"
              description="Upload a question paper PDF and mark scheme PDF to start the review-first import flow."
              icon={<FileSearch className="size-5" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
