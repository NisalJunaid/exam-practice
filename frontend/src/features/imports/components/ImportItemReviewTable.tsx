import { FilePenLine } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils/cn'

import type { DocumentImportItem } from '../types'
import { getQuestionPreview, getSourcePages } from '../utils'
import { type EditableImportItem } from './ImportItemEditorDialog'
import { ImportMatchStatusBadge } from './ImportMatchStatusBadge'

interface ImportItemReviewTableProps {
  items: DocumentImportItem[]
  drafts: Record<number, EditableImportItem>
  onEditItem: (item: DocumentImportItem) => void
}

export function ImportItemReviewTable({ items, drafts, onEditItem }: ImportItemReviewTableProps) {
  const ambiguousCount = items.filter((item) => drafts[item.id]?.matchStatus === 'ambiguous').length

  return (
    <div className="grid gap-4">
      {ambiguousCount ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Ambiguous rows need review</AlertTitle>
          <AlertDescription>
            {ambiguousCount} extracted {ambiguousCount === 1 ? 'row remains' : 'rows remain'} ambiguous. Review those rows before confirming the final paper import.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question key</TableHead>
              <TableHead>Question preview</TableHead>
              <TableHead>Answer preview</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source pages</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const draft = drafts[item.id]
              const matchStatus = draft?.matchStatus ?? item.matchStatus
              const rowWarning = matchStatus === 'ambiguous' || matchStatus === 'paper_only' || matchStatus === 'scheme_only'

              return (
                <TableRow key={item.id} className={cn(rowWarning && 'bg-amber-50/40 hover:bg-amber-50')}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{draft?.questionKey || item.questionKey || '—'}</p>
                      <p className="mt-1 text-xs text-slate-500">#{item.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="line-clamp-3 text-sm text-slate-700">{getQuestionPreview(draft?.questionText ?? item.questionText)}</p>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="line-clamp-3 text-sm text-slate-600">{getQuestionPreview(draft?.referenceAnswer ?? item.referenceAnswer, 'No answer preview extracted yet.')}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700">
                      <p>Resolved: <span className="font-medium">{draft?.resolvedMaxMarks ?? item.resolvedMaxMarks ?? '—'}</span></p>
                      <p className="text-xs text-slate-500">QP {item.questionPaperMarks ?? '—'} · MS {item.markSchemeMarks ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid gap-2">
                      <ImportMatchStatusBadge status={matchStatus} />
                      <span className="text-xs text-slate-500">{draft?.isApproved ?? item.isApproved ? 'Row ready' : 'Needs sign-off'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600">{getSourcePages(item)}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="outline" onClick={() => onEditItem(item)}>
                      <FilePenLine className="size-4" />
                      Edit row
                    </Button>
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
