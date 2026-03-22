import { useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAttemptReview } from '@/features/review/hooks'

export function ReviewPage() {
  const { attemptId = '' } = useParams()
  const reviewQuery = useAttemptReview(attemptId)

  if (reviewQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading review…</CardContent></Card>
  }

  if (!reviewQuery.data?.review) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Review data is not available.</CardContent></Card>
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Review"
        title="Per-question feedback"
        description="Detailed reasoning, strengths, and improvement feedback live on a dedicated review route so the UX stays exam-like and auditable."
      />
      <div className="grid gap-4">
        {reviewQuery.data.review.questions.map((question) => (
          <Card key={question.questionId}>
            <CardHeader>
              <CardTitle className="text-base">Question {question.questionNumber}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-slate-600 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                <p className="font-medium text-slate-900">{question.questionText}</p>
                <p><span className="font-medium text-slate-900">Student answer:</span> {question.studentAnswer || 'No answer submitted.'}</p>
                <p><span className="font-medium text-slate-900">Reasoning:</span> {question.reasoning}</p>
                <p><span className="font-medium text-slate-900">Feedback:</span> {question.feedback}</p>
              </div>
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-950">{question.awardedMarks}/{question.maxMarks}</p>
                <div>
                  <p className="font-medium text-slate-900">Strengths</p>
                  <ul className="ml-5 list-disc">
                    {question.strengths.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Mistakes</p>
                  <ul className="ml-5 list-disc">
                    {question.mistakes.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
