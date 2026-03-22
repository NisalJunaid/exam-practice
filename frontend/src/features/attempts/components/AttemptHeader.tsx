import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { AttemptDetail } from '@/features/attempts/types'
import { cn } from '@/lib/utils/cn'

function formatSaveStatus(status: AttemptHeaderProps['saveStatus'], editable: boolean) {
  if (!editable) return 'Read-only after submission'

  switch (status) {
    case 'saving':
      return 'Saving draft…'
    case 'saved':
      return 'All changes saved'
    case 'error':
      return 'Save failed — try again'
    case 'dirty':
      return 'Unsaved changes'
    default:
      return 'Ready'
  }
}

function formatSavedTime(lastSavedAt: Date | null) {
  if (!lastSavedAt) return 'No draft saved yet'

  return `Last saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}

export interface AttemptHeaderProps {
  attempt: AttemptDetail
  answeredCount: number
  totalQuestions: number
  editable: boolean
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
  lastSavedAt: Date | null
  saveDisabled?: boolean
  submitDisabled?: boolean
  onSave: () => void
  onSubmit: () => void
}

export function AttemptHeader({
  attempt,
  answeredCount,
  totalQuestions,
  editable,
  saveStatus,
  lastSavedAt,
  saveDisabled,
  submitDisabled,
  onSave,
  onSubmit,
}: AttemptHeaderProps) {
  const saveLabel = formatSaveStatus(saveStatus, editable)

  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <CardContent className="flex flex-col gap-4 p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700">Exam mode</Badge>
              <Badge className={cn(
                attempt.status === 'in_progress' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700',
              )}>
                {attempt.status === 'in_progress' ? 'In progress' : attempt.status.replace('_', ' ')}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700">{attempt.paper.subject}</Badge>
              {attempt.paper.paperCode ? <Badge className="bg-slate-100 text-slate-700">{attempt.paper.paperCode}</Badge> : null}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">{attempt.paper.title}</h1>
              <p className="mt-1 text-sm text-slate-600">
                Write one response per question, keep your work concise, and save before leaving the page.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-900">{answeredCount} of {totalQuestions} answered</p>
              <p className="mt-1 text-slate-500">{attempt.totalMaxMarks} total marks available</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button disabled={!editable || saveDisabled} onClick={onSave} variant="outline">
                {saveStatus === 'saving' ? 'Saving…' : 'Save draft'}
              </Button>
              <Button disabled={!editable || submitDisabled} onClick={onSubmit}>
                Submit attempt
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-slate-900">Save status: {saveLabel}</p>
            <p>{formatSavedTime(lastSavedAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-50 text-emerald-700">Answered: {answeredCount}</Badge>
            <Badge className="bg-amber-50 text-amber-700">Remaining: {Math.max(totalQuestions - answeredCount, 0)}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
