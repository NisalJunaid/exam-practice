import { FilePenLine, ImagePlus } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils/cn'

import type { DocumentImportItem } from '../types'
import { formatQuestionType, getQuestionPreview, getSourcePages } from '../utils'
import { type EditableImportItem } from './ImportItemEditorDialog'
import { ImportMatchStatusBadge } from './ImportMatchStatusBadge'

interface ImportItemReviewTableProps {
  items: DocumentImportItem[]
  drafts: Record<number, EditableImportItem>
  onEditItem: (item: DocumentImportItem) => void
  onUploadVisuals: (itemId: number, files: FileList | null) => void
}

export function ImportItemReviewTable({ items, drafts, onEditItem, onUploadVisuals }: ImportItemReviewTableProps) {
  const missingVisualCount = items.filter((item) => item.requiresVisualReference && item.visualAssets.length === 0).length

  return (
    <div className="grid gap-4">
      {missingVisualCount ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Image-dependent questions still need visuals</AlertTitle>
          <AlertDescription>{missingVisualCount} question{missingVisualCount === 1 ? '' : 's'} still require at least one draft visual before a normal approval flow can proceed.</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Visuals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const draft = drafts[item.id]
              const rowWarning = item.reviewStatus === 'missing_visual' || item.reviewStatus === 'warning'

              return (
                <TableRow key={item.id} className={cn(rowWarning && 'bg-amber-50/40 hover:bg-amber-50')}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{draft?.questionKey || item.questionKey || '—'}</p>
                      {item.requiresVisualReference ? <Badge className="mt-2 border-amber-200 bg-amber-100 text-amber-800">Visual required</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{formatQuestionType(draft?.questionType ?? item.questionType)}</TableCell>
                  <TableCell className="max-w-sm text-sm text-slate-700">{getQuestionPreview(draft?.questionText ?? item.questionText)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700">
                      <p><span className="font-medium">{draft?.resolvedMaxMarks ?? item.resolvedMaxMarks ?? '—'}</span> marks</p>
                      <p className="text-xs text-slate-500">Source pages: {getSourcePages(item)}</p>
                    </div>
                  </TableCell>
                  <TableCell><ImportMatchStatusBadge status={item.reviewStatus} /></TableCell>
                  <TableCell className="text-sm text-slate-600">{getSourcePages(item)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700">
                      <p>{item.visualAssets.length} attached</p>
                      {item.visualReferenceType ? <p className="text-xs text-slate-500">{formatQuestionType(item.visualReferenceType)}</p> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        <ImagePlus className="size-4" />
                        Upload visual
                        <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={(event) => onUploadVisuals(item.id, event.target.files)} />
                      </label>
                      <Button type="button" variant="outline" onClick={() => onEditItem(item)}>
                        <FilePenLine className="size-4" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
