import { useEffect, useState } from 'react'
import { usePaperAttempt } from '@/features/papers/hooks'

export function PaperAttemptPage({ attemptId }: { attemptId: string }) {
  const attempt = usePaperAttempt(attemptId)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attempt.data) return
    setAnswers(Object.fromEntries(attempt.data.questions.map((question) => [question.id, question.studentAnswer ?? ''])))
  }, [attempt.data])

  if (attempt.loading) return <div className="panel">Loading attempt…</div>
  if (attempt.error) return <div className="panel error-text">{attempt.error}</div>
  if (!attempt.data) return <div className="panel">Attempt not found.</div>

  return (
    <div className="stack-lg">
      <section className="panel">
        <div className="row-between wrap-gap">
          <div>
            <p className="eyebrow">{attempt.data.paper.subject}</p>
            <h1>{attempt.data.paper.title}</h1>
            <p className="subtle-text">Status: {attempt.data.status}. AI review and reference answers only appear after submission.</p>
          </div>
          <div className="score-summary">{attempt.data.totalAwardedMarks ?? '—'} / {attempt.data.totalMaxMarks}</div>
        </div>
        {attempt.data.markingSummary ? <p className="info-text">{attempt.data.markingSummary}</p> : null}
      </section>

      {attempt.data.questions.map((question, index) => (
        <article key={question.id} className="panel stack-md">
          <div className="row-between wrap-gap">
            <div>
              <p className="eyebrow">Question {question.questionKey ?? question.questionNumber}</p>
              <h2>Prompt</h2>
            </div>
            <div className="pill">{question.maxMarks} marks</div>
          </div>
          <p className="preformatted">{question.questionText}</p>
          {attempt.data.status === 'in_progress' ? (
            <>
              <label className="field">
                <span>Your answer</span>
                <textarea
                  value={answers[question.id] ?? ''}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                />
              </label>
              <div className="button-row">
                <button
                  className="button button-secondary"
                  onClick={async () => {
                    setError(null)
                    setSavingId(question.id)
                    try {
                      await attempt.saveAnswers([{ paper_question_id: question.id, student_answer: answers[question.id] ?? '' }])
                    } catch (err) {
                      setError((err as Error).message)
                    } finally {
                      setSavingId(null)
                    }
                  }}
                >
                  {savingId === question.id ? 'Saving…' : 'Save answer'}
                </button>
                {index === attempt.data.questions.length - 1 ? (
                  <button
                    className="button"
                    onClick={async () => {
                      setError(null)
                      setSubmitting(true)
                      try {
                        await attempt.saveAnswers(attempt.data.questions.map((item) => ({ paper_question_id: item.id, student_answer: answers[item.id] ?? '' })))
                        await attempt.submit()
                      } catch (err) {
                        setError((err as Error).message)
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                  >
                    {submitting ? 'Submitting…' : 'Submit paper'}
                  </button>
                ) : null}
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </>
          ) : (
            <div className="review-grid">
              <div className="review-panel">
                <h3>Submitted answer</h3>
                <p className="preformatted">{question.studentAnswer || 'No answer submitted.'}</p>
              </div>
              {question.review ? (
                <>
                  <div className="review-panel">
                    <h3>Marking outcome</h3>
                    <p className="score-inline">{question.review.awardedMarks}/{question.review.maxMarks}</p>
                    <p>{question.review.reasoning}</p>
                    <p>{question.review.feedback}</p>
                  </div>
                  <div className="review-panel">
                    <h3>Review details</h3>
                    <p><strong>Strengths:</strong> {question.review.strengths.join(', ') || 'None recorded.'}</p>
                    <p><strong>Mistakes:</strong> {question.review.mistakes.join(', ') || 'None recorded.'}</p>
                    <p><strong>Reference answer:</strong> {question.review.referenceAnswer ?? 'Not available.'}</p>
                    <p><strong>Marking guidelines:</strong> {question.review.markingGuidelines ?? 'Not available.'}</p>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
