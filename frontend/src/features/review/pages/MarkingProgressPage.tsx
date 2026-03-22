import { useEffect } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { routes } from '@/lib/constants/routes'

import { isAttemptMarkingInFlight, useMarkingStatus } from '../hooks'

function statusCopy(status: string) {
  switch (status) {
    case 'submitted':
      return {
        title: 'Submission received',
        description: 'Your attempt has been submitted. Marking will begin automatically in a moment.',
      }
    case 'marking':
      return {
        title: 'Marking in progress',
        description: 'We are scoring each answer and building your review. This page refreshes automatically while marking is active.',
      }
    case 'failed':
      return {
        title: 'Marking could not be completed',
        description: 'The marking pipeline failed, so results are not available yet. Please retry later or contact support.',
      }
    case 'completed':
      return {
        title: 'Marking completed',
        description: 'Your results are ready. Redirecting you to the summary page now.',
      }
    default:
      return {
        title: 'Attempt status unavailable',
        description: 'We could not determine the current marking state for this attempt.',
      }
  }
}

export function MarkingProgressPage() {
  const navigate = useNavigate()
  const { attemptId = '' } = useParams()
  const attemptQuery = useMarkingStatus(attemptId)

  const attempt = attemptQuery.data
  const status = attempt?.status ?? 'marking'
  const copy = statusCopy(status)

  useEffect(() => {
    if (attempt?.status === 'completed') {
      navigate(routes.attempts.resultsById(attempt.id), { replace: true })
    }
  }, [attempt?.id, attempt?.status, navigate])

  if (attemptQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    )
  }

  if (attemptQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-900">
        <CircleAlert className="mb-2 size-4" />
        <AlertTitle>Could not load marking status</AlertTitle>
        <AlertDescription>{attemptQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!attempt) {
    return (
      <EmptyState
        title="Attempt not found"
        description="We could not find that attempt. Return to your dashboard and reopen the paper from your recent work."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Marking progress"
        title={copy.title}
        description="Stay on this page after submission while the app polls the attempt status. When marking completes, you are moved to the results summary automatically."
      />

      <Card className="max-w-4xl overflow-hidden">
        <CardHeader className="gap-3 bg-slate-50">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
            {isAttemptMarkingInFlight(status) ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Status: {status}
          </div>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paper</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{attempt.paper.title}</p>
              <p className="text-sm text-slate-600">{attempt.paper.subject}{attempt.paper.paperCode ? ` · ${attempt.paper.paperCode}` : ''}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Attempt</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">#{attempt.id}</p>
              <p className="text-sm text-slate-600">{attempt.questions.length} questions submitted for marking.</p>
            </div>
          </div>

          {status === 'failed' ? (
            <Alert className="border-red-200 bg-red-50 text-red-900">
              <AlertTitle>Results unavailable</AlertTitle>
              <AlertDescription>
                Marking did not complete successfully for this attempt. You can return to the paper list or try opening this attempt again later.
              </AlertDescription>
            </Alert>
          ) : null}

          {status !== 'failed' ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">What happens next?</p>
              <ul className="mt-3 space-y-2">
                <li>• Your submission is checked question by question.</li>
                <li>• Scores and feedback are saved before the review becomes available.</li>
                <li>• The app will move you to the results summary as soon as marking finishes.</li>
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {status === 'completed' ? (
              <Link className={buttonVariants()} to={routes.attempts.resultsById(attempt.id)}>
                Open results now
              </Link>
            ) : null}
            <Link className={buttonVariants({ variant: 'outline' })} to={routes.dashboard}>
              Return to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
