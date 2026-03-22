import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAttemptResult } from '@/features/attempts/hooks'
import { routes } from '@/lib/constants/routes'

export function ResultsPage() {
  const { attemptId = '' } = useParams()
  const resultQuery = useAttemptResult(attemptId)

  if (resultQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading results…</CardContent></Card>
  }

  if (!resultQuery.data?.result) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Results are not available yet.</CardContent></Card>
  }

  const result = resultQuery.data.result

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Results"
        title={`Attempt ${result.attemptId} summary`}
        description="The summary route gives the overall score first, while detailed rationale stays on the dedicated review route."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Awarded" value={result.totalAwardedMarks} helper="Marks awarded across the full paper." />
        <StatCard label="Maximum" value={result.totalMaxMarks} helper="Maximum marks available." />
        <StatCard label="Percentage" value={`${result.percentage}%`} helper="Rounded result percentage." />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {result.questions.map((question) => (
            <div key={question.questionId} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">Question {question.questionNumber}</p>
                <p className="text-slate-500">Structured score summary for the review handoff.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {question.awardedMarks}/{question.maxMarks}
              </div>
            </div>
          ))}
          <Link className="text-sm font-medium text-blue-700" to={routes.attempts.reviewById(attemptId)}>Open detailed review →</Link>
        </CardContent>
      </Card>
    </div>
  )
}
