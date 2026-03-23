import { CheckCircle2, Circle, Dot, MapPinned } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

export interface NavigatorQuestionItem {
  id: number
  questionNumber: string
  displayLabel: string
  maxMarks: number
  answered: boolean
}

interface QuestionNavigatorProps {
  questions: NavigatorQuestionItem[]
  currentQuestionId: number | null
  onSelectQuestion: (questionId: number) => void
}

export function QuestionNavigator({ questions, currentQuestionId, onSelectQuestion }: QuestionNavigatorProps) {
  const answeredCount = questions.filter((question) => question.answered).length
  const currentQuestion = questions.find((question) => question.id === currentQuestionId)

  return (
    <Card className="flex border-slate-200 bg-white shadow-sm lg:max-h-[calc(100vh-12rem)] lg:flex-col">
      <CardHeader className="space-y-4 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Question navigator</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Jump between question parts without losing your place.</p>
          </div>
          <Badge className="bg-slate-100 text-slate-700">{questions.length}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <div className="font-semibold text-slate-900">Current</div>
            <div>{currentQuestion?.displayLabel ?? '—'}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-800">
            <div className="font-semibold">Answered</div>
            <div>{answeredCount}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <div className="font-semibold text-slate-900">Open</div>
            <div>{Math.max(questions.length - answeredCount, 0)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-3">
        <div className="grid max-h-[18rem] gap-2 overflow-y-auto pr-1 lg:max-h-none lg:pb-1">
          {questions.map((question, index) => {
            const isCurrent = question.id === currentQuestionId
            const statusLabel = isCurrent ? 'Current' : question.answered ? 'Answered' : 'Unanswered'

            return (
              <Button
                key={question.id}
                className={cn(
                  'h-auto justify-between rounded-2xl border px-3 py-3 text-left shadow-none transition-colors',
                  isCurrent
                    ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
                    : question.answered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                )}
                onClick={() => onSelectQuestion(question.id)}
                type="button"
                variant="outline"
              >
                <span className="min-w-0 space-y-1">
                  <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                    <MapPinned className="size-3.5" />
                    Part {index + 1}
                  </span>
                  <span className="block truncate text-sm font-semibold">{question.displayLabel}</span>
                  <span className="block text-xs opacity-80">Question {question.questionNumber} · {question.maxMarks} marks</span>
                </span>
                <span className="ml-3 flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
                  {isCurrent ? <Dot className="size-4" /> : question.answered ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
                  {statusLabel}
                </span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
