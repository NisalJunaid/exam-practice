import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { DocumentImportItem, ImportMatchStatus } from '../types'
import { getSourcePages } from '../utils'
import { ImportMatchStatusBadge } from './ImportMatchStatusBadge'

export interface EditableImportItem {
  id: number
  questionKey: string
  questionText: string
  referenceAnswer: string
  markingGuidelines: string
  resolvedMaxMarks: number
  matchStatus: ImportMatchStatus
  adminNotes: string
  isApproved: boolean
}

interface ImportItemEditorDialogProps {
  item: DocumentImportItem | null
  draft: EditableImportItem | null
  open: boolean
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: EditableImportItem) => void
}

export function ImportItemEditorDialog({ item, draft, open, isSaving, onOpenChange, onSave }: ImportItemEditorDialogProps) {
  const [localDraft, setLocalDraft] = useState<EditableImportItem | null>(draft)

  useEffect(() => {
    setLocalDraft(draft)
  }, [draft])

  if (!item || !localDraft) {
    return null
  }

  const hasWarning = localDraft.matchStatus === 'ambiguous' || localDraft.matchStatus === 'paper_only' || localDraft.matchStatus === 'scheme_only'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>Edit extracted item</DialogTitle>
          <DialogDescription>
            Review the extracted draft before confirmation. Changes here only affect the import draft until the full import is approved.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-6 pb-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{item.questionKey || 'Untitled item'}</span>
            <ImportMatchStatusBadge status={localDraft.matchStatus} />
            <span>Source pages: {getSourcePages(item)}</span>
          </div>

          {hasWarning ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <AlertTitle>Needs careful review</AlertTitle>
              <AlertDescription>
                This item is currently {localDraft.matchStatus.replace('_', ' ')}. Resolve the text, marks, and notes before confirming the full paper import.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="import-question-key">Question key</Label>
              <Input id="import-question-key" value={localDraft.questionKey} onChange={(event) => setLocalDraft((current) => current ? { ...current, questionKey: event.target.value } : current)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="import-resolved-max-marks">Resolved max marks</Label>
              <Input
                id="import-resolved-max-marks"
                inputMode="numeric"
                min={0}
                type="number"
                value={String(localDraft.resolvedMaxMarks)}
                onChange={(event) => setLocalDraft((current) => current ? { ...current, resolvedMaxMarks: Number(event.target.value || 0) } : current)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="import-match-status">Match status</Label>
            <select
              id="import-match-status"
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200"
              value={localDraft.matchStatus}
              onChange={(event) => setLocalDraft((current) => current ? { ...current, matchStatus: event.target.value as ImportMatchStatus } : current)}
            >
              <option value="matched">Matched</option>
              <option value="resolved">Resolved</option>
              <option value="ambiguous">Ambiguous</option>
              <option value="paper_only">Question paper only</option>
              <option value="scheme_only">Mark scheme only</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="import-question-text">Question text</Label>
            <Textarea id="import-question-text" value={localDraft.questionText} onChange={(event) => setLocalDraft((current) => current ? { ...current, questionText: event.target.value } : current)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="import-reference-answer">Answer preview / reference answer</Label>
              <Textarea id="import-reference-answer" value={localDraft.referenceAnswer} onChange={(event) => setLocalDraft((current) => current ? { ...current, referenceAnswer: event.target.value } : current)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="import-marking-guidelines">Marking guidelines</Label>
              <Textarea id="import-marking-guidelines" value={localDraft.markingGuidelines} onChange={(event) => setLocalDraft((current) => current ? { ...current, markingGuidelines: event.target.value } : current)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="import-admin-notes">Admin notes</Label>
            <Textarea id="import-admin-notes" value={localDraft.adminNotes} onChange={(event) => setLocalDraft((current) => current ? { ...current, adminNotes: event.target.value } : current)} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">Ready for import</p>
              <p className="text-slate-600">Toggle whether this draft row looks approved from a content-review perspective.</p>
            </div>
            <Button
              type="button"
              variant={localDraft.isApproved ? 'default' : 'outline'}
              onClick={() => setLocalDraft((current) => current ? { ...current, isApproved: !current.isApproved } : current)}
            >
              {localDraft.isApproved ? 'Marked ready' : 'Mark as ready'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={isSaving} type="button" onClick={() => onSave(localDraft)}>
            {isSaving ? 'Saving…' : 'Save draft changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
