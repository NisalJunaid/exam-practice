import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAttemptDetail, useSaveAttemptAnswers, useSubmitAttempt } from '@/features/attempts/hooks'
import { routes } from '@/lib/constants/routes'

export function TakeAttemptPage() {
  const navigate = useNavigate()
  const { attemptId = '' } = useParams()
  const attemptQuery = useAttemptDetail(attemptId)
  const saveMutation = useSaveAttemptAnswers(attemptId)
  const submitMutation = useSubmitAttempt(attemptId)

  const answers = useMemo(
    () => attemptQuery.data?.questions.map((question) => ({ paper_question_id: question.id, student_answer: question.studentAnswer ?? '' })) ?? [],
    [attemptQuery.data],
  )

  async function handleSaveDraft() {
    await saveMutation.mutateAsync({ answers })
  }

  async function handleSubmitAttempt() {
    const response = await submitMutation.mutateAsync()
    navigate(routes.attempts.markingById(response.id))
  }

  if (attemptQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading attempt…</CardContent></Card>
  }

  if (!attemptQuery.data) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Attempt not found.</CardContent></Card>
  }

  const attempt = attemptQuery.data

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Take attempt"
        title={attempt.paper.title}
        description="This page intentionally focuses on layout, answer slots, and transition controls. Rich autosave and timers can plug in without changing the route or provider structure."
        actions={
          <>
            <Button disabled={saveMutation.isPending} onClick={() => void handleSaveDraft()} variant="outline">{saveMutation.isPending ? 'Saving…' : 'Save draft'}</Button>
            <Button disabled={submitMutation.isPending} onClick={() => void handleSubmitAttempt()}>{submitMutation.isPending ? 'Submitting…' : 'Submit for marking'}</Button>
          </>
        }
      />

      <div className="grid gap-4">
        {attempt.questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base">Question {question.questionNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.stemContext ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{question.stemContext}</p> : null}
              <p className="text-sm leading-6 text-slate-700">{question.questionText}</p>
              <Textarea defaultValue={question.studentAnswer ?? ''} placeholder="Answer drafting area" />
              <p className="text-xs text-slate-500">Maximum marks: {question.maxMarks}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
