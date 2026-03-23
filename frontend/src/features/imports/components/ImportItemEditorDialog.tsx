import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { AnswerInteractionType, DocumentImportItem, QuestionType, VisualReferenceType } from '../types'
import { formatQuestionType, getSourcePages, summarizeInteractionConfig } from '../utils'
import { ImportMatchStatusBadge } from './ImportMatchStatusBadge'
import { ImportVisualUploader } from './ImportVisualUploader'

export interface EditableImportItem {
  id: number
  questionKey: string
  questionNumber: string
  parentKey: string
  questionType: QuestionType
  answerInteractionType: AnswerInteractionType
  interactionConfig: string
  stemContext: string
  questionText: string
  referenceAnswer: string
  markingGuidelines: string
  sampleFullMarkAnswer: string
  resolvedMaxMarks: number
  requiresVisualReference: boolean
  visualReferenceType: VisualReferenceType
  visualReferenceNote: string
  flags: DocumentImportItem['flags']
  questionPageNumber: number | null
  markSchemePageNumber: number | null
  adminNotes: string
  isApproved: boolean
}

interface ImportItemEditorDialogProps {
  item: DocumentImportItem | null
  draft: EditableImportItem | null
  open: boolean
  isSaving: boolean
  isUploadingVisuals: boolean
  isDeletingVisuals: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: EditableImportItem) => void
  onUploadVisuals: (itemId: number, files: FileList | null) => void
  onDeleteVisual: (visualId: number) => void
}

const questionTypes: QuestionType[] = ['short_answer', 'structured', 'table', 'diagram_label', 'calculation', 'multiple_part', 'essay', 'other']
const interactionTypes: AnswerInteractionType[] = ['short_text', 'long_text', 'select_single', 'select_multiple', 'multi_field', 'table_input', 'calculation_with_working', 'canvas_draw', 'graph_plot', 'image_upload', 'canvas_plus_text', 'diagram_annotation', 'matching', 'mcq_single', 'mcq_multiple', 'other']
const visualTypes: Exclude<VisualReferenceType, null>[] = ['diagram', 'table', 'graph', 'chemical_structure', 'image', 'mixed']

export function ImportItemEditorDialog({ item, draft, open, isSaving, isUploadingVisuals, isDeletingVisuals, onOpenChange, onSave, onUploadVisuals, onDeleteVisual }: ImportItemEditorDialogProps) {
  const [localDraft, setLocalDraft] = useState<EditableImportItem | null>(draft)

  useEffect(() => {
    setLocalDraft(draft)
  }, [draft])

  if (!item || !localDraft) return null

  const visualWarning = localDraft.requiresVisualReference && item.visualAssets.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit imported question</DialogTitle>
          <DialogDescription>
            Review and adjust every field before approval. Draft visuals remain attached to the import item until the paper is confirmed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[75vh] gap-6 overflow-y-auto px-1 pb-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{item.questionKey}</span>
            <ImportMatchStatusBadge status={item.reviewStatus} />
            <span>{getSourcePages(item)}</span>
          </div>

          {visualWarning ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <AlertTitle>Visual upload still required</AlertTitle>
              <AlertDescription>This question is marked as image-dependent and does not yet have any uploaded draft visuals.</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Question key"><Input value={localDraft.questionKey} onChange={(event) => setLocalDraft({ ...localDraft, questionKey: event.target.value })} /></Field>
            <Field label="Question number"><Input value={localDraft.questionNumber} onChange={(event) => setLocalDraft({ ...localDraft, questionNumber: event.target.value })} /></Field>
            <Field label="Parent key"><Input value={localDraft.parentKey} onChange={(event) => setLocalDraft({ ...localDraft, parentKey: event.target.value })} /></Field>
            <Field label="Question type">
              <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={localDraft.questionType} onChange={(event) => setLocalDraft({ ...localDraft, questionType: event.target.value as QuestionType })}>
                {questionTypes.map((type) => <option key={type} value={type}>{formatQuestionType(type)}</option>)}
              </select>
            </Field>
            <Field label="Answer interaction type">
              <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={localDraft.answerInteractionType} onChange={(event) => setLocalDraft({ ...localDraft, answerInteractionType: event.target.value as AnswerInteractionType })}>
                {interactionTypes.map((type) => <option key={type} value={type}>{formatQuestionType(type)}</option>)}
              </select>
            </Field>
            <Field label="Max marks"><Input type="number" min={0} value={String(localDraft.resolvedMaxMarks)} onChange={(event) => setLocalDraft({ ...localDraft, resolvedMaxMarks: Number(event.target.value || 0) })} /></Field>
            <Field label="Question page"><Input type="number" min={0} value={localDraft.questionPageNumber ?? ''} onChange={(event) => setLocalDraft({ ...localDraft, questionPageNumber: event.target.value ? Number(event.target.value) : null })} /></Field>
            <Field label="Mark scheme page"><Input type="number" min={0} value={localDraft.markSchemePageNumber ?? ''} onChange={(event) => setLocalDraft({ ...localDraft, markSchemePageNumber: event.target.value ? Number(event.target.value) : null })} /></Field>
          </div>

          <Field label="Stem context"><Textarea value={localDraft.stemContext} onChange={(event) => setLocalDraft({ ...localDraft, stemContext: event.target.value })} /></Field>
          <Field label="Question text"><Textarea value={localDraft.questionText} onChange={(event) => setLocalDraft({ ...localDraft, questionText: event.target.value })} /></Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Reference answer"><Textarea value={localDraft.referenceAnswer} onChange={(event) => setLocalDraft({ ...localDraft, referenceAnswer: event.target.value })} /></Field>
            <Field label="Marking guidelines"><Textarea value={localDraft.markingGuidelines} onChange={(event) => setLocalDraft({ ...localDraft, markingGuidelines: event.target.value })} /></Field>
          </div>

          <Field label="Interaction config JSON">
            <Textarea className="min-h-[12rem] font-mono text-xs" value={localDraft.interactionConfig} onChange={(event) => setLocalDraft({ ...localDraft, interactionConfig: event.target.value })} />
          </Field>
          <p className="text-xs text-slate-500">Current summary: {summarizeInteractionConfig(item.interactionConfig)}</p>

          <Field label="Sample full-mark answer"><Textarea value={localDraft.sampleFullMarkAnswer} onChange={(event) => setLocalDraft({ ...localDraft, sampleFullMarkAnswer: event.target.value })} /></Field>

          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
              <input type="checkbox" checked={localDraft.requiresVisualReference} onChange={(event) => setLocalDraft({ ...localDraft, requiresVisualReference: event.target.checked, visualReferenceType: event.target.checked ? localDraft.visualReferenceType ?? 'diagram' : null })} />
              Requires visual reference
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-900">
              <input type="checkbox" checked={localDraft.isApproved} onChange={(event) => setLocalDraft({ ...localDraft, isApproved: event.target.checked })} />
              Mark item ready for approval
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={localDraft.flags.needsReview} onChange={(event) => setLocalDraft({ ...localDraft, flags: { ...localDraft.flags, needsReview: event.target.checked } })} />
              Needs manual review
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={localDraft.flags.lowConfidenceMatch} onChange={(event) => setLocalDraft({ ...localDraft, flags: { ...localDraft.flags, lowConfidenceMatch: event.target.checked } })} />
              Low confidence extraction
            </label>
          </div>

          {localDraft.requiresVisualReference ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Visual reference type">
                <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={localDraft.visualReferenceType ?? 'diagram'} onChange={(event) => setLocalDraft({ ...localDraft, visualReferenceType: event.target.value as VisualReferenceType })}>
                  {visualTypes.map((type) => <option key={type} value={type}>{formatQuestionType(type)}</option>)}
                </select>
              </Field>
              <Field label="Visual reference note"><Textarea value={localDraft.visualReferenceNote} onChange={(event) => setLocalDraft({ ...localDraft, visualReferenceNote: event.target.value })} /></Field>
            </div>
          ) : null}

          <Field label="Admin notes"><Textarea value={localDraft.adminNotes} onChange={(event) => setLocalDraft({ ...localDraft, adminNotes: event.target.value })} /></Field>

          <ImportVisualUploader item={item} isUploading={isUploadingVisuals} isDeleting={isDeletingVisuals} onUpload={(files) => onUploadVisuals(item.id, files)} onDelete={onDeleteVisual} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={isSaving} type="button" onClick={() => onSave(localDraft)}>{isSaving ? 'Saving…' : 'Save draft changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
