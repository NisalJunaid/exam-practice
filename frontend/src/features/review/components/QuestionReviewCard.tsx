import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AttemptReviewQuestion } from '../types'
import { FeedbackPanel } from './FeedbackPanel'
import { MarkBreakdownBadge } from './MarkBreakdownBadge'

interface QuestionReviewCardProps {
  question: AttemptReviewQuestion
}

function renderLongText(value: string | null | undefined, fallback: string) {
  if (!value || !value.trim()) {
    return <p className="text-sm text-slate-500">{fallback}</p>
  }

  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</p>
}

export function QuestionReviewCard({ question }: QuestionReviewCardProps) {
  const heading = question.questionKey ? `${question.questionKey} · Question ${question.questionNumber}` : `Question ${question.questionNumber}`

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-slate-100 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl">{heading}</CardTitle>
          <p className="text-sm text-slate-500">Read the question and your answer first, then expand the feedback sections below.</p>
        </div>
        <MarkBreakdownBadge awardedMarks={question.awardedMarks} maxMarks={question.maxMarks} className="w-fit" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Question prompt</p>
          {question.stemContext ? <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500">{question.stemContext}</p> : null}
          <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-slate-900">{question.questionText}</p>
        </div>

        <details className="rounded-2xl border border-slate-200" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">Student answer</summary>
          <div className="border-t border-slate-100 px-4 py-4">
            {renderLongText(question.studentAnswer, 'No answer was submitted for this question.')}
          </div>
        </details>

        <details className="rounded-2xl border border-slate-200" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">Marker reasoning</summary>
          <div className="border-t border-slate-100 px-4 py-4">
            {renderLongText(question.reasoning, 'Reasoning was not provided for this question.')}
          </div>
        </details>

        <details className="rounded-2xl border border-slate-200" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">Improvement feedback</summary>
          <div className="border-t border-slate-100 px-4 py-4">
            {renderLongText(question.feedback, 'No additional improvement feedback was returned.')}
          </div>
        </details>

        <div className="grid gap-4 lg:grid-cols-2">
          <FeedbackPanel title="Strengths" items={question.strengths} emptyLabel="No strengths were highlighted for this answer." tone="positive" />
          <FeedbackPanel title="Mistakes" items={question.mistakes} emptyLabel="No mistakes were listed for this answer." tone="negative" />
        </div>
      </CardContent>
    </Card>
  )
}
