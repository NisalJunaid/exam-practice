import { CheckCircle2, CircleDot, Clock3, Save, Send } from 'lucide-react'

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
    case 'uploading':
      return 'Uploading drawing…'
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

function buildPaperIdentifier(attempt: AttemptDetail) {
  return attempt.paper.paperCode || attempt.paper.title
}

export interface AttemptHeaderProps {
  attempt: AttemptDetail
  answeredCount: number
  totalQuestions: number
  editable: boolean
  saveStatus: 'idle' | 'dirty' | 'uploading' | 'saving' | 'saved' | 'error'
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
  const paperIdentifier = buildPaperIdentifier(attempt)

  return (
    <Card className="sticky top-20 z-30 border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <CardContent className="flex flex-col gap-4 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700">{attempt.paper.subject}</Badge>
            {attempt.paper.paperCode ? <Badge className="bg-slate-100 text-slate-700">{attempt.paper.paperCode}</Badge> : null}
            <Badge className={editable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
              {editable ? 'In progress' : attempt.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Exam workspace</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{paperIdentifier}</h1>
              {attempt.paper.paperCode && attempt.paper.paperCode !== attempt.paper.title ? (
                <span className="truncate text-sm text-slate-500">{attempt.paper.title}</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Answered {answeredCount}/{totalQuestions}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Marks {attempt.totalMaxMarks}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {saveStatus === 'saved' ? <CheckCircle2 className="size-3.5" /> : <CircleDot className="size-3.5" />}
              {saveLabel}
              {lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-none">
          <div
            className={cn(
              'rounded-2xl border px-4 py-3 sm:min-w-[12rem]',
              timer.tone === 'urgent'
                ? 'border-red-200 bg-red-50 text-red-900'
                : timer.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-900',
            )}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
              <Clock3 className="size-4" />
              Time remaining
            </div>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">{timer.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button className="min-w-[6.5rem]" disabled={!editable || saveDisabled} onClick={onSave} type="button" variant="outline">
              <Save className="size-4" />
              {saveStatus === 'saving' ? 'Saving…' : 'Save'}
            </Button>
            <Button className="min-w-[7rem]" disabled={!editable || submitDisabled} onClick={onSubmit} type="button">
              <Send className="size-4" /> Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
