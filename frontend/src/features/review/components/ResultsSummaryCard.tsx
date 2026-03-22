import { Link } from 'react-router-dom'

import { StatCard } from '@/components/common/StatCard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { routes } from '@/lib/constants/routes'

import type { AttemptResultPayload } from '../types'
import { MarkBreakdownBadge } from './MarkBreakdownBadge'

interface ResultsSummaryCardProps {
  attemptId: string
  paperTitle: string
  result: AttemptResultPayload
}

function getPercentage(totalAwardedMarks: number | null, totalMaxMarks: number) {
  if (totalMaxMarks === 0) return 0
  return Math.round(((totalAwardedMarks ?? 0) / totalMaxMarks) * 100)
}

export function ResultsSummaryCard({ attemptId, paperTitle, result }: ResultsSummaryCardProps) {
  const percentage = getPercentage(result.totalAwardedMarks, result.totalMaxMarks)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Awarded" value={result.totalAwardedMarks ?? 0} helper="Marks awarded across the full paper." />
        <StatCard label="Maximum" value={result.totalMaxMarks} helper="Maximum marks available for this attempt." />
        <StatCard label="Percentage" value={`${percentage}%`} helper="Rounded score percentage for a quick overall read." />
      </div>

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle>{paperTitle}</CardTitle>
            <CardDescription>
              Start with the score summary, then open the detailed review when you are ready to inspect each answer.
            </CardDescription>
          </div>
          <Link className={buttonVariants({ size: 'sm' })} to={routes.attempts.reviewById(attemptId)}>
            Open detailed review
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.markingSummary ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Overall marking summary</p>
              <p className="mt-2">{result.markingSummary}</p>
            </div>
          ) : null}

          <div className="space-y-3">
            {result.questions.length ? (
              result.questions.map((question) => (
                <div
                  key={question.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {question.questionKey ? `${question.questionKey} · ` : ''}
                      Question {question.questionNumber}
                    </p>
                    <p className="text-sm text-slate-500">Per-question summary before opening the full feedback.</p>
                  </div>
                  <MarkBreakdownBadge awardedMarks={question.awardedMarks} maxMarks={question.maxMarks} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No question summaries were returned for this attempt.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
