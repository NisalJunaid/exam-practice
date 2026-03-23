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
import { useApproveImport, useDeleteImportItemVisual, useImportDetail, useImportItems, useUpdateImportItem, useUploadImportItemVisuals } from '@/features/imports/hooks'
import type { DocumentImportItem } from '@/features/imports/types'
import { formatImportStatus, formatQuestionType, getCounts, getImportStatusTone, stringifyMetadataValue } from '@/features/imports/utils'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

import { type EditableImportItem, ImportItemEditorDialog } from '../components/ImportItemEditorDialog'
import { ImportItemReviewTable } from '../components/ImportItemReviewTable'
import { ImportSummaryCard } from '../components/ImportSummaryCard'

function toEditableItem(item: DocumentImportItem): EditableImportItem {
  return {
    id: item.id,
    questionKey: item.questionKey,
    questionNumber: item.questionNumber ?? '',
    parentKey: item.parentKey ?? '',
    questionType: item.questionType,
    stemContext: item.stemContext ?? '',
    answerInteractionType: item.answerInteractionType,
    interactionConfig: JSON.stringify(item.interactionConfig ?? {}, null, 2),
    questionText: item.questionText ?? '',
    referenceAnswer: item.referenceAnswer ?? '',
    markingGuidelines: item.markingGuidelines ?? '',
    sampleFullMarkAnswer: item.sampleFullMarkAnswer ?? '',
    resolvedMaxMarks: item.resolvedMaxMarks ?? item.questionPaperMarks ?? item.markSchemeMarks ?? 0,
    requiresVisualReference: item.requiresVisualReference,
    visualReferenceType: item.visualReferenceType,
    visualReferenceNote: item.visualReferenceNote ?? '',
    flags: item.flags,
    questionPageNumber: item.questionPageNumber,
    markSchemePageNumber: item.markSchemePageNumber,
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
  const uploadVisuals = useUploadImportItemVisuals(importId)
  const deleteVisual = useDeleteImportItemVisual(importId)
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

  const dirtyItemIds = useMemo(() => items.filter((item) => JSON.stringify(drafts[item.id]) !== JSON.stringify(toEditableItem(item))).map((item) => item.id), [drafts, items])
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null
  const selectedDraft = selectedItem ? drafts[selectedItem.id] : null
  const missingVisuals = counts.missingVisuals > 0
  const readyForApproval = importQuery.data?.status === 'needs_review' && dirtyItemIds.length === 0 && !approveImport.isPending && !importQuery.data?.approvedPaperId

  async function saveSingleDraft(draft: EditableImportItem) {
    const sourceItem = items.find((item) => item.id === draft.id)

    await updateItem.mutateAsync({
      itemId: draft.id,
      questionKey: draft.questionKey,
      questionNumber: draft.questionNumber || null,
      parentKey: draft.parentKey || null,
      questionType: draft.questionType,
      answerInteractionType: draft.answerInteractionType,
      interactionConfig: JSON.parse(draft.interactionConfig || '{}'),
      stemContext: draft.stemContext || null,
      questionText: draft.questionText,
      referenceAnswer: draft.referenceAnswer || null,
      markingGuidelines: draft.markingGuidelines || null,
      sampleFullMarkAnswer: draft.sampleFullMarkAnswer || null,
      resolvedMaxMarks: draft.resolvedMaxMarks,
      requiresVisualReference: draft.requiresVisualReference,
      visualReferenceType: draft.requiresVisualReference ? draft.visualReferenceType : null,
      visualReferenceNote: draft.visualReferenceNote || null,
      flags: { ...draft.flags, hasVisual: sourceItem ? sourceItem.visualAssets.length > 0 : draft.flags.hasVisual },
      questionPageNumber: draft.questionPageNumber,
      markSchemePageNumber: draft.markSchemePageNumber,
      adminNotes: draft.adminNotes || null,
      isApproved: draft.isApproved,
    })
  }

  async function handleSaveAll() {
    if (!dirtyItemIds.length) {
      toast({ title: 'No draft changes to save', description: 'All review edits are already synced.', variant: 'info' })
      return
    }

    try {
      setIsSavingAll(true)
      for (const itemId of dirtyItemIds) {
        const draft = drafts[itemId]
        if (draft) await saveSingleDraft(draft)
      }
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
      toast({ title: 'Draft changes saved', description: 'Your review edits are now stored on the import draft.', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not save draft changes', description: error instanceof Error ? error.message : 'Try saving again.', variant: 'error' })
    } finally {
      setIsSavingAll(false)
    }
  }

  async function handleUploadVisuals(itemId: number, files: FileList | null) {
    if (!files?.length) return

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files[]', file))

    try {
      await uploadVisuals.mutateAsync({ itemId, formData })
      toast({ title: 'Visuals uploaded', description: 'Draft reference images are now attached to this import item.', variant: 'success' })
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
    } catch (error) {
      toast({ title: 'Could not upload visuals', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  async function handleDeleteVisual(visualId: number) {
    try {
      await deleteVisual.mutateAsync(visualId)
      toast({ title: 'Visual deleted', description: 'The draft visual asset has been removed.', variant: 'success' })
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
    } catch (error) {
      toast({ title: 'Could not delete visual', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  async function handleSaveDialogDraft(draft: EditableImportItem) {
    try {
      setDrafts((current) => ({ ...current, [draft.id]: draft }))
      await saveSingleDraft(draft)
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
      toast({ title: 'Question updated', description: `Saved draft changes for ${draft.questionKey}.`, variant: 'success' })
      setSelectedItemId(null)
    } catch (error) {
      toast({ title: 'Could not save question changes', description: error instanceof Error ? error.message : 'Try editing the item again.', variant: 'error' })
    }
  }

  async function handleApproveImport(overrideMissingVisuals = false) {
    try {
      const result = await approveImport.mutateAsync(overrideMissingVisuals)
      toast({ title: 'Paper import confirmed', description: `${result.paperTitle} is now available in the admin paper inventory.`, variant: 'success' })
      await Promise.all([importQuery.refetch(), itemsQuery.refetch()])
    } catch (error) {
      toast({ title: 'Could not confirm import', description: error instanceof Error ? error.message : 'Try again after resolving issues.', variant: 'error' })
    }
  }

  if (importQuery.isLoading) return <ReviewPageSkeleton />
  if (importQuery.isError) return <EmptyState title="Could not load import draft" description={importQuery.error instanceof Error ? importQuery.error.message : 'Try again to load the import review.'} action={<Button type="button" variant="outline" onClick={() => void importQuery.refetch()}>Retry</Button>} />
  if (!importQuery.data) return <EmptyState title="Import draft not found" description="This import may have been deleted or is not accessible from the current account." />

  const documentImport = importQuery.data
  const metadataEntries = Object.entries(documentImport.metadata ?? {})
  const questionTypeEntries = Object.entries(documentImport.preview.questionTypes ?? {})

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Import review"
        title={`Import #${documentImport.id}`}
        description="Validate the JSON-derived draft, edit extracted questions, attach reference visuals for image-dependent items, and confirm the final paper only after review."
        actions={(
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => { void importQuery.refetch(); void itemsQuery.refetch() }}>
              <RefreshCcw className="size-4" />
              Refresh
            </Button>
            <Button type="button" variant="outline" disabled={isSavingAll || !dirtyItemIds.length} onClick={() => void handleSaveAll()}>
              {isSavingAll ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Save draft changes
            </Button>
            <Button type="button" size="lg" disabled={!readyForApproval} onClick={() => void handleApproveImport(false)}>
              {approveImport.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Confirm import
            </Button>
          </div>
        )}
      />

      <Alert className="border-blue-200 bg-blue-50 text-blue-900">
        <AlertTitle>Review-first workflow</AlertTitle>
        <AlertDescription>The import draft is editable. Live paper, question, rubric, and final visual records are only created when you confirm the import.</AlertDescription>
      </Alert>

      {missingVisuals ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <TriangleAlert className="mb-2 size-4" />
          <AlertTitle>Missing visuals for image-dependent questions</AlertTitle>
          <AlertDescription>
            {counts.missingVisuals} image-dependent question{counts.missingVisuals === 1 ? '' : 's'} still have no uploaded draft visuals.
            <Button className="ml-3" type="button" variant="outline" onClick={() => void handleApproveImport(true)}>Approve with override</Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {documentImport.approvedPaperId ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertTitle>Paper import complete</AlertTitle>
          <AlertDescription>
            Final paper #{documentImport.approvedPaperId} has been created. <Link className="font-medium underline" to={routes.admin.papers.byId(documentImport.approvedPaperId)}>Open final paper</Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ImportSummaryCard label="Total questions" value={counts.total} helper="All draft questions in the canonical JSON import." tone="info" />
        <ImportSummaryCard label="Ready" value={counts.ready} helper="Items currently ready for approval." tone="success" />
        <ImportSummaryCard label="Warnings" value={counts.warnings} helper="Questions still carrying review flags." tone={counts.warnings ? 'warning' : 'default'} />
        <ImportSummaryCard label="Missing visuals" value={counts.missingVisuals} helper="Image-dependent questions without uploaded draft visuals." tone={counts.missingVisuals ? 'danger' : 'default'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>Import status</CardTitle>
                <CardDescription>Track schema validation, review progress, and approval state.</CardDescription>
              </div>
              <Badge className={getImportStatusTone(documentImport.status)}>{formatImportStatus(documentImport.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <StatusField label="Input method" value={documentImport.inputMethod ?? '—'} />
            <StatusField label="Source JSON" value={documentImport.jsonFileName ?? documentImport.questionPaperName ?? 'Pasted JSON'} />
            <StatusField label="Processed at" value={documentImport.processedAt ? new Date(documentImport.processedAt).toLocaleString() : 'Pending'} />
            <StatusField label="Unsaved edits" value={String(dirtyItemIds.length)} />
            <StatusField label="Visual-dependent questions" value={String(counts.visualDependent)} />
            <StatusField label="Approved paper" value={documentImport.approvedPaperId ? `#${documentImport.approvedPaperId}` : 'Not imported yet'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question type mix</CardTitle>
            <CardDescription>Quick breakdown of imported question structures for review planning.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            {questionTypeEntries.length ? questionTypeEntries.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="font-medium text-slate-900">{formatQuestionType(type)}</span>
                <span>{count}</span>
              </div>
            )) : <p>No question type data available.</p>}
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="review">Review questions</TabsTrigger>
          <TabsTrigger value="metadata">Paper metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Draft questions</CardTitle>
              <CardDescription>Every imported question remains editable until final approval. Upload visuals directly from the table for image-dependent items.</CardDescription>
            </CardHeader>
            <CardContent>
              {itemsQuery.isLoading && !items.length ? (
                <div className="grid gap-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div>
              ) : items.length ? (
                <ImportItemReviewTable
                  items={items}
                  drafts={drafts}
                  onEditItem={(item) => {
                    setDrafts((current) => ({ ...current, [item.id]: current[item.id] ?? toEditableItem(item) }))
                    setSelectedItemId(item.id)
                  }}
                  onUploadVisuals={(itemId, files) => void handleUploadVisuals(itemId, files)}
                />
              ) : (
                <EmptyState title="No draft questions found" description="This import did not produce any draft question rows." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Paper metadata</CardTitle>
              <CardDescription>Review the top-level paper details before confirming the final paper import.</CardDescription>
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
                <EmptyState title="No metadata detected" description="The JSON payload did not include paper-level metadata." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ImportItemEditorDialog
        item={selectedItem}
        draft={selectedDraft}
        open={Boolean(selectedItem && selectedDraft)}
        isSaving={updateItem.isPending}
        isUploadingVisuals={uploadVisuals.isPending}
        isDeletingVisuals={deleteVisual.isPending}
        onOpenChange={(open) => { if (!open) setSelectedItemId(null) }}
        onSave={(draft) => void handleSaveDialogDraft(draft)}
        onUploadVisuals={(itemId, files) => void handleUploadVisuals(itemId, files)}
        onDeleteVisual={(visualId) => void handleDeleteVisual(visualId)}
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

function ReviewPageSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)}</div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
