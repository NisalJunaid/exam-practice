import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, LoaderCircle, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApproveImport, useImportDetail, useImportItems, useUpdateImportItem } from '@/features/imports/hooks'
import type { DocumentImportItem } from '@/features/imports/types'
import {
  formatImportStatus,
  getCounts,
  getImportStatusTone,
  stringifyMetadataValue,
} from '@/features/imports/utils'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

import { type EditableImportItem, ImportItemEditorDialog } from '../components/ImportItemEditorDialog'
import { ImportItemReviewTable } from '../components/ImportItemReviewTable'
import { ImportSummaryCard } from '../components/ImportSummaryCard'

function toEditableItem(item: DocumentImportItem): EditableImportItem {
  return {
    id: item.id,
    questionKey: item.questionKey ?? '',
    questionText: item.questionText ?? '',
    referenceAnswer: item.referenceAnswer ?? '',
    markingGuidelines: item.markingGuidelines ?? '',
    resolvedMaxMarks: item.resolvedMaxMarks ?? item.questionPaperMarks ?? item.markSchemeMarks ?? 0,
    matchStatus: item.matchStatus,
    adminNotes: item.adminNotes ?? '',
    isApproved: item.isApproved,
  }
}

export function AdminImportReviewPage() {
  const { importId = '' } = useParams()
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState('review')
  const [drafts, setDrafts] = useState<Record<number, EditableImportItem>>({})
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [isSavingAll, setIsSavingAll] = useState(false)
  const importQuery = useImportDetail(importId)
  const itemsQuery = useImportItems(importId)
  const updateItem = useUpdateImportItem(importId)
  const approveImport = useApproveImport(importId)

  const items = useMemo(() => itemsQuery.data ?? importQuery.data?.items ?? [], [itemsQuery.data, importQuery.data?.items])
  const counts = useMemo(() => getCounts(importQuery.data?.summary, items), [importQuery.data?.summary, items])

  useEffect(() => {
    if (!items.length) return
    setDrafts((current) => {
      const next = { ...current }
      for (const item of items) {
        next[item.id] = current[item.id] ?? toEditableItem(item)
      }
      return next
    })
  }, [items])

  const dirtyItemIds = useMemo(() => {
    return items
      .filter((item) => {
        const draft = drafts[item.id]
        if (!draft) return false
        return JSON.stringify(draft) !== JSON.stringify(toEditableItem(item))
      })
      .map((item) => item.id)
  }, [drafts, items])

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null
  const selectedDraft = selectedItem ? drafts[selectedItem.id] : null
  const hasWarnings = counts.ambiguous > 0 || counts.unmatched > 0
  const readyForApproval = importQuery.data?.status === 'needs_review' && dirtyItemIds.length === 0 && !approveImport.isPending

  async function saveSingleDraft(draft: EditableImportItem) {
    const original = items.find((item) => item.id === draft.id)
    if (!original) return

    await updateItem.mutateAsync({
      itemId: draft.id,
      questionKey: draft.questionKey,
      questionText: draft.questionText,
      resolvedMaxMarks: draft.resolvedMaxMarks,
      matchStatus: draft.matchStatus,
      referenceAnswer: draft.referenceAnswer,
      markingGuidelines: draft.markingGuidelines,
      adminNotes: draft.adminNotes,
      isApproved: draft.isApproved,
    })
  }

  async function handleSaveAll() {
    if (!dirtyItemIds.length) {
      toast({ title: 'No draft changes to save', description: 'All extracted rows are already synced.', variant: 'info' })
      return
    }

    try {
      setIsSavingAll(true)
      for (const itemId of dirtyItemIds) {
        const draft = drafts[itemId]
        if (draft) {
          await saveSingleDraft(draft)
        }
      }
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
      toast({ title: 'Draft changes saved', description: 'Your item edits are now stored on the import draft.', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Could not save draft changes',
        description: error instanceof Error ? error.message : 'Try saving again after reviewing the edited rows.',
        variant: 'error',
      })
    } finally {
      setIsSavingAll(false)
    }
  }

  async function handleSaveDialogDraft(draft: EditableImportItem) {
    try {
      setDrafts((current) => ({ ...current, [draft.id]: draft }))
      await saveSingleDraft(draft)
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
      toast({ title: 'Row updated', description: `Saved draft changes for ${draft.questionKey || 'the selected row'}.`, variant: 'success' })
      setSelectedItemId(null)
    } catch (error) {
      toast({
        title: 'Could not save row changes',
        description: error instanceof Error ? error.message : 'Try editing the row again.',
        variant: 'error',
      })
    }
  }

  async function handleApproveImport() {
    if (!importQuery.data) return

    try {
      const result = await approveImport.mutateAsync()
      toast({
        title: 'Paper import confirmed',
        description: `${result.paperTitle} is now available in the admin paper inventory.`,
        variant: 'success',
      })
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
    } catch (error) {
      toast({
        title: 'Could not confirm import',
        description: error instanceof Error ? error.message : 'Try again after resolving draft issues.',
        variant: 'error',
      })
    }
  }

  if (importQuery.isLoading) {
    return <ReviewPageSkeleton />
  }

  if (importQuery.isError) {
    return (
      <EmptyState
        title="Could not load import draft"
        description={importQuery.error instanceof Error ? importQuery.error.message : 'Try again to load the import review.'}
        action={<Button type="button" variant="outline" onClick={() => void importQuery.refetch()}>Retry</Button>}
      />
    )
  }

  if (!importQuery.data) {
    return <EmptyState title="Import draft not found" description="This import may have been deleted or is not accessible from the current account." />
  }

  const documentImport = importQuery.data
  const metadataEntries = Object.entries(documentImport.metadata ?? {})
  const isProcessing = documentImport.status === 'processing' || documentImport.status === 'uploaded'
  const hasApprovedPaper = Boolean(documentImport.approvedPaperId)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Import review"
        title={`Import #${documentImport.id}`}
        description="Review extracted draft metadata and extracted rows, save draft-only edits, then confirm the import when the paper is ready to become a real admin paper."
        actions={(
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => { void importQuery.refetch(); void itemsQuery.refetch() }}>
              <RefreshCcw className="size-4" />
              Refresh
            </Button>
            <Button type="button" variant="outline" disabled={isSavingAll || !dirtyItemIds.length || isProcessing} onClick={() => void handleSaveAll()}>
              {isSavingAll ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Save Draft Changes
            </Button>
            <Button type="button" size="lg" disabled={!readyForApproval || isProcessing || hasApprovedPaper} onClick={() => void handleApproveImport()}>
              {approveImport.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Confirm and Import Paper
            </Button>
          </div>
        )}
      />

      <Alert className="border-blue-200 bg-blue-50 text-blue-900">
        <AlertTitle>Draft-only extracted data</AlertTitle>
        <AlertDescription>
          Everything on this screen remains a draft until you click <span className="font-medium">Confirm and Import Paper</span>. Use this review to fix extraction issues before any final paper becomes available.
        </AlertDescription>
      </Alert>

      {documentImport.errorMessage ? (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTitle>Processing error</AlertTitle>
          <AlertDescription>{documentImport.errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isProcessing ? (
        <Alert className="border-blue-200 bg-blue-50 text-blue-900">
          <AlertTitle>Extraction is still running</AlertTitle>
          <AlertDescription>
            The PDFs have been uploaded and are still being processed. This page refreshes automatically while the import status is {formatImportStatus(documentImport.status)}.
          </AlertDescription>
        </Alert>
      ) : null}

      {hasWarnings ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <TriangleAlert className="mb-2 size-4" />
          <AlertTitle>Review warnings before confirmation</AlertTitle>
          <AlertDescription>
            There are {counts.ambiguous} ambiguous rows and {counts.unmatched} unmatched rows. You can still inspect every item below and save draft corrections before approval.
          </AlertDescription>
        </Alert>
      ) : null}

      {hasApprovedPaper ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertTitle>Paper import complete</AlertTitle>
          <AlertDescription>
            This import has already created paper #{documentImport.approvedPaperId}. You can continue auditing the draft record or open the final paper in admin.
            {' '}
            <Link className="font-medium underline" to={routes.admin.papers.byId(documentImport.approvedPaperId)}>Open final paper</Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ImportSummaryCard label="Total extracted" value={counts.total} helper="All extracted rows detected for this import draft." tone="info" />
        <ImportSummaryCard label="Matched" value={counts.matched} helper="Rows with a confident question/mark scheme pairing." tone="success" />
        <ImportSummaryCard label="Ambiguous" value={counts.ambiguous} helper="Rows needing manual review because pairing confidence is unclear." tone={counts.ambiguous ? 'warning' : 'default'} />
        <ImportSummaryCard label="Unmatched" value={counts.unmatched} helper="Rows only found in one source document and likely needing edits." tone={counts.unmatched ? 'danger' : 'default'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>Import status</CardTitle>
                <CardDescription>Track extraction, review readiness, and approval state from one place.</CardDescription>
              </div>
              <Badge className={getImportStatusTone(documentImport.status)}>{formatImportStatus(documentImport.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <StatusField label="Question paper" value={documentImport.questionPaperName ?? '—'} />
            <StatusField label="Mark scheme" value={documentImport.markSchemeName ?? '—'} />
            <StatusField label="Processed at" value={documentImport.processedAt ? new Date(documentImport.processedAt).toLocaleString() : 'Pending'} />
            <StatusField label="Unsaved row edits" value={String(dirtyItemIds.length)} />
            <StatusField label="Review notes" value={documentImport.reviewNotes ?? '—'} />
            <StatusField label="Approved paper" value={documentImport.approvedPaperId ? `#${documentImport.approvedPaperId}` : 'Not imported yet'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review checklist</CardTitle>
            <CardDescription>Use these checks to keep the import workflow review-first.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <ChecklistRow done={!isProcessing} label="Extraction complete" />
            <ChecklistRow done={items.length > 0} label="Extracted rows available" />
            <ChecklistRow done={!dirtyItemIds.length} label="No unsaved draft edits" />
            <ChecklistRow done={!hasWarnings} label="No ambiguous or unmatched rows" />
            <ChecklistRow done={hasApprovedPaper} label="Final paper created after confirmation" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="review">Review rows</TabsTrigger>
          <TabsTrigger value="metadata">Detected metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Extracted rows</CardTitle>
              <CardDescription>Inspect each extracted row, review warnings, and save draft corrections before approving the final import.</CardDescription>
            </CardHeader>
            <CardContent>
              {itemsQuery.isLoading && !items.length ? (
                <div className="grid gap-3">
                  {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
                </div>
              ) : itemsQuery.isError ? (
                <EmptyState
                  title="Could not load extracted rows"
                  description={itemsQuery.error instanceof Error ? itemsQuery.error.message : 'Try reloading the extracted rows.'}
                  action={<Button type="button" variant="outline" onClick={() => void itemsQuery.refetch()}>Retry</Button>}
                />
              ) : items.length ? (
                <ImportItemReviewTable
                  items={items}
                  drafts={drafts}
                  onEditItem={(item) => {
                    setDrafts((current) => ({ ...current, [item.id]: current[item.id] ?? toEditableItem(item) }))
                    setSelectedItemId(item.id)
                  }}
                />
              ) : (
                <EmptyState
                  title="No extracted rows yet"
                  description={isProcessing ? 'Extraction is still running. Refresh after processing completes to review the rows.' : 'No extracted rows were returned for this import.'}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Detected metadata</CardTitle>
              <CardDescription>Review the paper-level metadata detected from the uploaded PDFs before confirming the import.</CardDescription>
            </CardHeader>
            <CardContent>
              {metadataEntries.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {metadataEntries.map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key.replaceAll('_', ' ')}</p>
                      <Separator className="my-3" />
                      <p className="text-sm text-slate-700">{stringifyMetadataValue(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No metadata detected" description="The extractor did not return paper-level metadata for this import draft." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ImportItemEditorDialog
        draft={selectedDraft}
        item={selectedItem}
        open={Boolean(selectedItem && selectedDraft)}
        isSaving={updateItem.isPending}
        onOpenChange={(open) => {
          if (!open) setSelectedItemId(null)
        }}
        onSave={(draft) => void handleSaveDialogDraft(draft)}
      />
    </div>
  )
}

function StatusField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 font-medium text-slate-900">{value}</p>
    </div>
  )
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
      <div className={`flex size-7 items-center justify-center rounded-full ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        <CheckCircle2 className="size-4" />
      </div>
      <span className={done ? 'font-medium text-slate-900' : 'text-slate-600'}>{label}</span>
    </div>
  )
}

function ReviewPageSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
