import { useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useApproveImport, useImportDetail, useUpdateImportItem } from '@/features/imports/hooks'

export function AdminImportReviewPage() {
  const { importId = '' } = useParams()
  const importQuery = useImportDetail(importId)
  const updateItem = useUpdateImportItem(importId)
  const approveImport = useApproveImport(importId)

  if (importQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading import…</CardContent></Card>
  }

  if (!importQuery.data) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Import not found.</CardContent></Card>
  }

  const documentImport = importQuery.data

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Import review"
        title={`Import #${documentImport.id}`}
        description="This review page keeps metadata, item inspection, and approval controls together while leaving room for richer diffing and editor dialogs later."
        actions={<Button disabled={approveImport.isPending || documentImport.status !== 'needs_review'} onClick={() => void approveImport.mutateAsync()}>{approveImport.isPending ? 'Approving…' : 'Approve import'}</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(documentImport.summary ?? {}).slice(0, 4).map(([key, value]) => (
          <Card key={key}><CardContent className="pt-6 text-sm"><span className="font-medium capitalize">{key}:</span> {String(value)}</CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Badge className="w-fit bg-blue-50 text-blue-700">Status: {documentImport.status}</Badge>
          <CardTitle>Detected metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          {Object.entries(documentImport.metadata ?? {}).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{key}</p>
              <p>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Import items</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {documentImport.items?.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{item.questionKey}</p>
                <Badge className="bg-slate-100 text-slate-700">{item.matchStatus}</Badge>
              </div>
              <div className="space-y-3">
                <Input defaultValue={item.questionText ?? ''} onBlur={(event) => {
                  if (!item.questionText && !event.target.value) return
                  void updateItem.mutateAsync({
                    itemId: item.id,
                    questionKey: item.questionKey,
                    questionText: event.target.value,
                    resolvedMaxMarks: item.resolvedMaxMarks ?? item.questionPaperMarks ?? item.markSchemeMarks ?? 0,
                    matchStatus: item.matchStatus,
                    referenceAnswer: item.referenceAnswer,
                    markingGuidelines: item.markingGuidelines,
                    adminNotes: item.adminNotes,
                    isApproved: item.isApproved,
                  })
                }} />
                <p className="text-xs text-slate-500">Question marks: {item.questionPaperMarks ?? '—'} · Scheme marks: {item.markSchemeMarks ?? '—'} · Resolved: {item.resolvedMaxMarks ?? '—'}</p>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <p>Question page: {item.questionPageNumber ?? '—'}</p>
                <p>Scheme page: {item.markSchemePageNumber ?? '—'}</p>
                <p>Approved: {item.isApproved ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )) ?? <p className="text-sm text-slate-600">No parsed items are available yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
