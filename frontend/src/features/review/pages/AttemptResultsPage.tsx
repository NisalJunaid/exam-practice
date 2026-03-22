import { CircleAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { routes } from '@/lib/constants/routes'

import { useAttemptResults, useMarkingStatus } from '../hooks'
import { ResultsSummaryCard } from '../components/ResultsSummaryCard'

export function AttemptResultsPage() {
  const { attemptId = '' } = useParams()
  const attemptQuery = useMarkingStatus(attemptId)
  const resultsQuery = useAttemptResults(attemptId, attemptQuery.data?.status === 'completed')

  if (attemptQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  if (attemptQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-900">
        <CircleAlert className="mb-2 size-4" />
        <AlertTitle>Could not load attempt status</AlertTitle>
        <AlertDescription>{attemptQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  const attempt = attemptQuery.data

  if (!attempt) {
    return (
      <EmptyState
        title="Attempt not found"
        description="That attempt could not be loaded. Return to your dashboard and reopen your latest work from there."
      />
    )
  }

  if (attempt.status === 'submitted' || attempt.status === 'marking') {
    return <Navigate to={routes.attempts.markingById(attempt.id)} replace />
  }

  if (attempt.status === 'failed') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Results"
          title="Results unavailable"
          description="The attempt could not be marked successfully, so the score summary is not available."
        />
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTitle>Marking failed</AlertTitle>
          <AlertDescription>
            This attempt ended in a failed marking state. Reopen the paper list or check back later if the backend retries the job.
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Link className={buttonVariants({ variant: 'outline' })} to={routes.dashboard}>
            Return to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (resultsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  if (resultsQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-900">
        <CircleAlert className="mb-2 size-4" />
        <AlertTitle>Could not load results</AlertTitle>
        <AlertDescription>{resultsQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!resultsQuery.data?.result) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-slate-600">Results are not available for this attempt yet.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Results"
        title={`Attempt ${attempt.id} summary`}
        description="This summary keeps the overall score front and center. Open the detailed review only when you want to inspect feedback question by question."
      />
      <ResultsSummaryCard attemptId={attemptId} paperTitle={attempt.paper.title} result={resultsQuery.data.result} />
    </div>
  )
}
