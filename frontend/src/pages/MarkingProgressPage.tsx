import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAttemptResult } from '@/features/attempts/hooks'
import { routes } from '@/lib/constants/routes'

export function MarkingProgressPage() {
  const { attemptId = '' } = useParams()
  const resultQuery = useAttemptResult(attemptId)

  const status = resultQuery.data?.status ?? 'marking'
  const ready = status === 'completed'

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Marking progress"
        title="AI marking pipeline status"
        description="The progress route is separated from the taking interface so polling, retries, and fallback messaging can evolve independently."
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <Badge className="w-fit bg-blue-50 text-blue-700">Status: {status}</Badge>
          <CardTitle>{ready ? 'Marking completed' : 'Your attempt is being marked'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>{ready ? 'The results route is now available.' : 'The frontend is polling the typed results endpoint and will naturally hand off to summary and review views.'}</p>
          {ready ? (
            <Link className="font-medium text-blue-700" to={routes.attempts.resultsById(attemptId)}>
              Open results →
            </Link>
          ) : (
            <p>Stay on this screen or refresh later. Query refetching is configured in TanStack Query.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
