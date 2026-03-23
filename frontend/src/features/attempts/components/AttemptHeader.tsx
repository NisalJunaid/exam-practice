import { Clock3, Save, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { AttemptDetail } from '@/features/attempts/types'
import { useAttemptTimer } from '@/features/attempts/useAttemptTimer'
import { cn } from '@/lib/utils/cn'

function formatSaveStatus(status: AttemptHeaderProps['saveStatus'], editable: boolean) {
  if (!editable) return 'Read-only after submission'

  switch (status) {
    case 'saving':
      return 'Saving…'
    case 'saved':
      return 'Saved'
    case 'error':
      return 'Save failed'
    case 'dirty':
      return 'Unsaved changes'
    default:
      return 'Ready'
  }
}

export interface AttemptHeaderProps {
  attempt: AttemptDetail
  answeredCount: number
  totalQuestions: number
  editable: boolean
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
  onExpire?: () => void
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
  onExpire,
  lastSavedAt,
  saveDisabled,
  submitDisabled,
  onSave,
  onSubmit,
}: AttemptHeaderProps) {
  const saveLabel = formatSaveStatus(saveStatus, editable)
  const timer = useAttemptTimer({ initialRemainingSeconds: attempt.remainingSeconds, isActive: editable }, onExpire)

  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700">{attempt.paper.subject}</Badge>
            {attempt.paper.paperCode ? <Badge className="bg-slate-100 text-slate-700">{attempt.paper.paperCode}</Badge> : null}
            <Badge className={editable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
              {editable ? 'In progress' : attempt.status.replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">{attempt.paper.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Work steadily, keep answers focused on the mark allocation, and review the navigator before you submit.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-medium text-slate-900">Question {Math.min(answeredCount + 1, totalQuestions)} prep</p>
              <p>{answeredCount} of {totalQuestions} answered</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-medium text-slate-900">Save state</p>
              <p>{saveLabel}{lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[18rem] lg:items-end">
          <div className={cn(
            'w-full rounded-3xl border px-4 py-4 text-right lg:w-auto lg:min-w-[16rem]',
            timer.tone === 'urgent'
              ? 'border-red-200 bg-red-50 text-red-900'
              : timer.tone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-slate-200 bg-slate-50 text-slate-900',
          )}>
            <div className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <Clock3 className="size-4" /> Time remaining
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{timer.label}</p>
            <p className="mt-1 text-sm opacity-80">{attempt.paper.durationMinutes ? `${attempt.paper.durationMinutes} minute paper` : 'Timed from server timestamps'}</p>
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto">
            <Button disabled={!editable || saveDisabled} onClick={onSave} type="button" variant="outline">
              <Save className="size-4" />
              {saveStatus === 'saving' ? 'Saving…' : 'Save'}
            </Button>
            <Button disabled={!editable || submitDisabled} onClick={onSubmit} type="button">
              <Send className="size-4" /> Submit
            </Button>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Badge className="bg-emerald-50 text-emerald-700">Answered: {answeredCount}</Badge>
            <Badge className="bg-slate-100 text-slate-700">Remaining: {Math.max(totalQuestions - answeredCount, 0)}</Badge>
            <Badge className="bg-slate-100 text-slate-700">Marks: {attempt.totalMaxMarks}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
