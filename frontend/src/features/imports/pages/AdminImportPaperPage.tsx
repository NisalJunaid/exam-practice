import { ArrowRight, FileJson } from 'lucide-react'
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

import { ImportJsonSampleCard } from '../components/ImportJsonSampleCard'
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
        description: 'The canonical JSON was validated and a draft review record is ready.',
        variant: 'success',
      })
      navigate(routes.admin.imports.byId(created.id))
    } catch (error) {
      toast({
        title: 'Could not create import draft',
        description: error instanceof Error ? error.message : 'Check the JSON structure and try again.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin imports"
        title="JSON paper ingestion"
        description="Import one canonical paper JSON payload, review every extracted question, upload reference visuals where needed, and only then confirm the final paper import."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ImportUploadForm isSubmitting={createImport.isPending} onSubmit={handleSubmit} />
        <ImportJsonSampleCard />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent import drafts</CardTitle>
          <CardDescription>Reopen previous JSON imports to continue review, attach visuals, or confirm the final paper.</CardDescription>
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
                    <p className="text-sm text-slate-600">{item.jsonFileName ?? item.questionPaperName ?? 'Pasted canonical JSON'}</p>
                    <p className="text-xs text-slate-500">{counts.total} questions • {counts.visualDependent} visual-dependent • {counts.missingVisuals} missing visuals • {counts.warnings} warnings</p>
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
              description="Upload or paste a canonical paper JSON payload to start the review-first import flow."
              icon={<FileJson className="size-5" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
