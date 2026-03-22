import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AttemptHeader } from '@/features/attempts/components/AttemptHeader'
import { QuestionAnswerCard } from '@/features/attempts/components/QuestionAnswerCard'
import { QuestionNavigator } from '@/features/attempts/components/QuestionNavigator'
import { SubmitAttemptDialog } from '@/features/attempts/components/SubmitAttemptDialog'
import { useAttemptDetail, useSaveAttemptAnswers, useSubmitAttempt } from '@/features/attempts/hooks'
import { routes } from '@/lib/constants/routes'

const AUTOSAVE_DELAY_MS = 1200

function normalizeAnswers(questions: Array<{ id: number; studentAnswer: string | null }>) {
  return Object.fromEntries(questions.map((question) => [question.id, question.studentAnswer ?? ''])) as Record<number, string>
}

export function TakeAttemptPage() {
  const navigate = useNavigate()
  const { attemptId = '' } = useParams()
  const attemptQuery = useAttemptDetail(attemptId)
  const saveMutation = useSaveAttemptAnswers(attemptId)
  const submitMutation = useSubmitAttempt(attemptId)

  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({})
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null)
  const [draftAttemptId, setDraftAttemptId] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  const autosaveTimer = useRef<number | null>(null)

  const attempt = attemptQuery.data
  const editable = attempt?.status === 'in_progress'




  useEffect(() => () => {
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current)
    }
  }, [])

  const orderedQuestions = useMemo(() => attempt?.questions ?? [], [attempt])

  const serverAnswers = useMemo(() => normalizeAnswers(orderedQuestions), [orderedQuestions])

  const answersByQuestion = useMemo(() => {
    if (!attempt || draftAttemptId !== attempt.id) {
      return serverAnswers
    }

    return { ...serverAnswers, ...draftAnswers }
  }, [attempt, draftAnswers, draftAttemptId, serverAnswers])

  const answeredCount = useMemo(
    () => orderedQuestions.filter((question) => (answersByQuestion[question.id] ?? '').trim().length > 0).length,
    [answersByQuestion, orderedQuestions],
  )

  const navigatorQuestions = useMemo(
    () => orderedQuestions.map((question) => ({
      id: question.id,
      questionNumber: question.questionNumber,
      maxMarks: question.maxMarks,
      answered: (answersByQuestion[question.id] ?? '').trim().length > 0,
    })),
    [answersByQuestion, orderedQuestions],
  )

  const activeQuestionId = currentQuestionId ?? orderedQuestions[0]?.id ?? null
  const effectiveSaveStatus = editable ? saveStatus : 'saved'
  const pendingSave = effectiveSaveStatus === 'dirty' || saveMutation.isPending

  async function persistAnswers() {
    if (!attempt || !editable) return

    setSaveStatus('saving')

    try {
      await saveMutation.mutateAsync({
        answers: orderedQuestions.map((question) => ({
          paper_question_id: question.id,
          student_answer: answersByQuestion[question.id] ?? '',
        })),
      })
      setDraftAttemptId(attempt.id)
      setDraftAnswers({})
      setSaveStatus('saved')
      setLastSavedAt(new Date())
    } catch (error) {
      setSaveStatus('error')
      throw error
    }
  }

  function queueAutosave() {
    if (!editable) return

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current)
    }

    autosaveTimer.current = window.setTimeout(() => {
      void persistAnswers()
    }, AUTOSAVE_DELAY_MS)
  }

  function handleAnswerChange(questionId: number, value: string) {
    if (attempt) {
      setDraftAttemptId(attempt.id)
    }

    setDraftAnswers((current) => ({ ...current, [questionId]: value }))
    setCurrentQuestionId(questionId)
    setSaveStatus('dirty')
    queueAutosave()
  }

  function handleSelectQuestion(questionId: number) {
    setCurrentQuestionId(questionId)
    const element = document.getElementById(`question-card-${questionId}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleConfirmSubmit() {
    if (!attempt) return

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current)
    }

    if (saveStatus === 'dirty') {
      try {
        await persistAnswers()
      } catch {
        return
      }
    }

    const response = await submitMutation.mutateAsync()
    setSubmitDialogOpen(false)
    navigate(routes.attempts.markingById(response.id))
  }

  if (attemptQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-[32rem] rounded-3xl" />
        </div>
      </div>
    )
  }

  if (attemptQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-900">
        <CircleAlert className="mb-2 size-4" />
        <AlertTitle>Could not load attempt</AlertTitle>
        <AlertDescription>{attemptQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!attempt) {
    return (
      <EmptyState
        title="Attempt not found"
        description="The requested attempt could not be loaded. Return to the paper catalog to start a new paper."
      />
    )
  }

  return (
    <>
      <div className="space-y-6">
        <AttemptHeader
          answeredCount={answeredCount}
          attempt={attempt}
          editable={Boolean(editable)}
          lastSavedAt={lastSavedAt}
          onSave={() => void persistAnswers()}
          onSubmit={() => setSubmitDialogOpen(true)}
          saveDisabled={saveMutation.isPending || !orderedQuestions.length}
          saveStatus={effectiveSaveStatus}
          submitDisabled={submitMutation.isPending || saveMutation.isPending}
          totalQuestions={orderedQuestions.length}
        />

        {effectiveSaveStatus === 'error' ? (
          <Alert className="border-red-200 bg-red-50 text-red-900">
            <AlertTitle>Draft save failed</AlertTitle>
            <AlertDescription>
              We could not save your latest changes. Your text is still on screen, so you can try saving again.
            </AlertDescription>
          </Alert>
        ) : null}

        {!editable ? (
          <Alert className="border-blue-200 bg-blue-50 text-blue-900">
            <AlertTitle>Attempt is read-only</AlertTitle>
            <AlertDescription>
              This attempt has already been submitted, so answers are locked while marking progresses or after completion.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <QuestionNavigator
              currentQuestionId={activeQuestionId}
              onSelectQuestion={handleSelectQuestion}
              questions={navigatorQuestions}
            />
          </div>

          <div className="space-y-4">
            {orderedQuestions.map((question, index) => (
              <div id={`question-card-${question.id}`} key={question.id}>
                <QuestionAnswerCard
                  editable={Boolean(editable)}
                  index={index}
                  isAnswered={(answersByQuestion[question.id] ?? '').trim().length > 0}
                  isCurrent={question.id === activeQuestionId}
                  onChange={handleAnswerChange}
                  onFocus={setCurrentQuestionId}
                  question={question}
                  value={answersByQuestion[question.id] ?? ''}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SubmitAttemptDialog
        answeredCount={answeredCount}
        onCancel={() => setSubmitDialogOpen(false)}
        onConfirm={() => void handleConfirmSubmit()}
        open={submitDialogOpen}
        pendingSave={pendingSave}
        totalQuestions={orderedQuestions.length}
      />

      {submitMutation.isPending ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg">
            <LoaderCircle className="size-4 animate-spin" />
            Submitting attempt…
          </div>
        </div>
      ) : null}
    </>
  )
}
