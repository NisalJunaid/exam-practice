import { CircleAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { routes } from '@/lib/constants/routes'

import { useAttemptReview, useMarkingStatus } from '../hooks'
import { QuestionReviewCard } from '../components/QuestionReviewCard'
import { ResultsSummaryCard } from '../components/ResultsSummaryCard'

export function AttemptReviewPage() {
  const { attemptId = '' } = useParams()
  const attemptQuery = useMarkingStatus(attemptId)
  const reviewQuery = useAttemptReview(attemptId, attemptQuery.data?.status === 'completed')

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
        description="We could not load that attempt. Return to your dashboard and open the attempt again from your recent work."
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
          eyebrow="Review"
          title="Review unavailable"
          description="Detailed feedback is only shown after marking completes successfully."
        />
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTitle>Marking failed</AlertTitle>
          <AlertDescription>This attempt could not be reviewed because the marking pipeline failed.</AlertDescription>
        </Alert>
        <Link className={buttonVariants({ variant: 'outline' })} to={routes.dashboard}>
          Return to dashboard
        </Link>
      </div>
    )
  }

  if (reviewQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  if (reviewQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-900">
        <CircleAlert className="mb-2 size-4" />
        <AlertTitle>Could not load detailed review</AlertTitle>
        <AlertDescription>{reviewQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  const review = reviewQuery.data?.review

  if (!review) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-slate-600">Review data is not available for this attempt.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Review"
        title={`Attempt ${attempt.id} detailed review`}
        description="The score summary stays at the top, followed by per-question cards with your answer, the awarded marks, and detailed feedback."
      />

      <ResultsSummaryCard
        attemptId={attemptId}
        paperTitle={attempt.paper.title}
        result={{
          status: attempt.status,
          totalAwardedMarks: attempt.totalAwardedMarks,
          totalMaxMarks: attempt.totalMaxMarks,
          markingSummary: review.markingSummary,
          questions: review.questions.map((question) => ({
            id: question.id,
            questionNumber: question.questionNumber,
            questionKey: question.questionKey,
            awardedMarks: question.awardedMarks,
            maxMarks: question.maxMarks,
          })),
        }}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Question-by-question review</h2>
            <p className="text-sm text-slate-600">Expand each card to inspect the answer, reasoning, strengths, mistakes, and improvement guidance.</p>
          </div>
          <Link className={buttonVariants({ variant: 'outline' })} to={routes.attempts.resultsById(attempt.id)}>
            Back to summary
          </Link>
        </div>

        {review.questions.length ? (
          <div className="space-y-4">
            {review.questions.map((question) => (
              <QuestionReviewCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No review details returned</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              The attempt completed, but no per-question review payload was returned.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
