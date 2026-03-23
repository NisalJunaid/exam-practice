import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AttemptHeader } from '@/features/attempts/components/AttemptHeader'
import { QuestionAnswerCard } from '@/features/attempts/components/QuestionAnswerCard'
import { QuestionNavigator } from '@/features/attempts/components/QuestionNavigator'
import { SubmitAttemptDialog } from '@/features/attempts/components/SubmitAttemptDialog'
import { useAttemptDetail, useSaveAttemptAnswers, useSubmitAttempt } from '@/features/attempts/hooks'
import type { AttemptDetail } from '@/features/attempts/types'
import { routes } from '@/lib/constants/routes'

const AUTOSAVE_DELAY_MS = 1200

function buildAnswerMap(attempt: AttemptDetail | undefined) {
  return Object.fromEntries((attempt?.questions ?? []).map((question) => [question.id, question.studentAnswer ?? ''])) as Record<number, string>
}

function storageKey(attemptId: string) {
  return `attempt-draft:${attemptId}`
}

function getNavigatorLabel(question: AttemptDetail['questions'][number], index: number) {
  return question.questionKey?.trim() || question.questionNumber?.trim() || `Question ${index + 1}`
}

export function TakeAttemptPage() {
  const navigate = useNavigate()
  const { attemptId = '' } = useParams()
  const attemptQuery = useAttemptDetail(attemptId)
  const saveMutation = useSaveAttemptAnswers(attemptId)
  const submitMutation = useSubmitAttempt(attemptId)

  const [localAnswers, setLocalAnswers] = useState<Record<number, string>>({})
  const [dirtyQuestionIds, setDirtyQuestionIds] = useState<number[]>([])
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [autoSubmitting, setAutoSubmitting] = useState(false)

  const hydratedAttemptId = useRef<number | null>(null)
  const latestAnswersRef = useRef<Record<number, string>>({})
  const latestDirtyIdsRef = useRef<number[]>([])

  const attempt = attemptQuery.data
  const editable = attempt?.status === 'in_progress'
  const orderedQuestions = useMemo(() => attempt?.questions ?? [], [attempt])

  useEffect(() => {
    latestAnswersRef.current = localAnswers
  }, [localAnswers])

  useEffect(() => {
    latestDirtyIdsRef.current = dirtyQuestionIds
  }, [dirtyQuestionIds])

  useEffect(() => {
    if (!attempt) return

    const serverAnswers = buildAnswerMap(attempt)
    const persistedDraft = window.sessionStorage.getItem(storageKey(String(attempt.id)))
    const persistedPayload = persistedDraft ? JSON.parse(persistedDraft) as { answers?: Record<number, string>; dirtyIds?: number[] } : null

    if (hydratedAttemptId.current !== attempt.id) {
      hydratedAttemptId.current = attempt.id
      const mergedAnswers = { ...serverAnswers, ...(persistedPayload?.answers ?? {}) }
      setLocalAnswers(mergedAnswers)
      setDirtyQuestionIds(persistedPayload?.dirtyIds ?? [])
      setCurrentQuestionId(attempt.questions[0]?.id ?? null)
      setSaveStatus((persistedPayload?.dirtyIds?.length ?? 0) > 0 ? 'dirty' : 'idle')
      return
    }

    setLocalAnswers((current) => {
      const next = { ...current }
      for (const question of attempt.questions) {
        if (!latestDirtyIdsRef.current.includes(question.id)) {
          next[question.id] = question.studentAnswer ?? ''
        }
      }
      return next
    })
  }, [attempt])

  useEffect(() => {
    if (!attempt) return
    window.sessionStorage.setItem(storageKey(String(attempt.id)), JSON.stringify({ answers: localAnswers, dirtyIds: dirtyQuestionIds }))
  }, [attempt, dirtyQuestionIds, localAnswers])

  const persistAnswers = useCallback(async (questionIds?: number[]) => {
    if (!attempt || !editable) return

    const targetIds = questionIds?.length ? questionIds : latestDirtyIdsRef.current
    if (!targetIds.length) return

    setSaveStatus('saving')

    try {
      await saveMutation.mutateAsync({
        answers: targetIds.map((questionId) => ({
          paper_question_id: questionId,
          student_answer: latestAnswersRef.current[questionId] ?? '',
        })),
      })

      setDirtyQuestionIds((current) => current.filter((id) => !targetIds.includes(id)))
      setSaveStatus('saved')
      setLastSavedAt(new Date())
    } catch {
      setSaveStatus('error')
      throw new Error('save failed')
    }
  }, [attempt, editable, saveMutation])

  useEffect(() => {
    if (!editable || !dirtyQuestionIds.length) return

    const timer = window.setTimeout(() => {
      void persistAnswers([...latestDirtyIdsRef.current])
    }, AUTOSAVE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [dirtyQuestionIds, editable, persistAnswers])



  useEffect(() => {
    if (!attempt) return
    if (!editable) {
      window.sessionStorage.removeItem(storageKey(String(attempt.id)))
    }
  }, [attempt, editable])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyQuestionIds.length) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirtyQuestionIds.length])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirtyQuestionIds.length > 0 && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const shouldLeave = window.confirm('You have unsaved changes. Leave the exam page and discard the local draft?')
      if (shouldLeave) blocker.proceed()
      else blocker.reset()
    }
  }, [blocker])

  const answeredCount = useMemo(
    () => orderedQuestions.filter((question) => (localAnswers[question.id] ?? '').trim().length > 0).length,
    [localAnswers, orderedQuestions],
  )

  const navigatorQuestions = useMemo(
    () => orderedQuestions.map((question, index) => ({
      id: question.id,
      questionNumber: question.questionNumber,
      displayLabel: getNavigatorLabel(question, index),
      maxMarks: question.maxMarks,
      answered: (localAnswers[question.id] ?? '').trim().length > 0,
    })),
    [localAnswers, orderedQuestions],
  )

  const activeQuestionId = currentQuestionId ?? orderedQuestions[0]?.id ?? null

  useEffect(() => {
    if (!orderedQuestions.length) return

    const observer = new window.IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (!visibleEntry) return

        const nextQuestionId = Number((visibleEntry.target as HTMLElement).dataset.questionId)
        if (!Number.isFinite(nextQuestionId)) return

        setCurrentQuestionId((current) => (current === nextQuestionId ? current : nextQuestionId))
      },
      {
        rootMargin: '-180px 0px -45% 0px',
        threshold: [0.2, 0.35, 0.6],
      },
    )

    orderedQuestions.forEach((question) => {
      const element = document.getElementById(`question-card-${question.id}`)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [orderedQuestions])

  const handleAnswerChange = (questionId: number, value: string) => {
    setLocalAnswers((current) => ({ ...current, [questionId]: value }))
    setDirtyQuestionIds((current) => (current.includes(questionId) ? current : [...current, questionId]))
    setCurrentQuestionId(questionId)
    setSaveStatus('dirty')
  }

  const handleSelectQuestion = (questionId: number) => {
    setCurrentQuestionId(questionId)
    const element = document.getElementById(`question-card-${questionId}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleConfirmSubmit = async () => {
    if (!attempt) return

    if (dirtyQuestionIds.length) {
      try {
        await persistAnswers([...dirtyQuestionIds])
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
    return <EmptyState description="The requested attempt could not be loaded. Return to the paper catalog to start a new paper." title="Attempt not found" />
  }

  return (
    <>
      <div className="space-y-5">
        <AttemptHeader
          answeredCount={answeredCount}
          attempt={attempt}
          editable={Boolean(editable)}
          lastSavedAt={lastSavedAt}
          onSave={() => void persistAnswers([...dirtyQuestionIds])}
          onSubmit={() => setSubmitDialogOpen(true)}
          saveDisabled={saveMutation.isPending || !dirtyQuestionIds.length}
          saveStatus={editable ? saveStatus : 'saved'}
          submitDisabled={submitMutation.isPending || saveMutation.isPending}
          onExpire={async () => {
            if (!attempt || !editable || autoSubmitting || submitMutation.isPending) return
            setAutoSubmitting(true)
            try {
              const response = await submitMutation.mutateAsync()
              navigate(routes.attempts.markingById(response.id))
            } finally {
              setAutoSubmitting(false)
            }
          }}
          totalQuestions={orderedQuestions.length}
        />

        {saveStatus === 'error' ? (
          <Alert className="border-red-200 bg-red-50 text-red-900">
            <AlertTitle>Save failed</AlertTitle>
            <AlertDescription>Your answer is still stored locally on this device. Try saving again before leaving the page.</AlertDescription>
          </Alert>
        ) : null}

        {!editable ? (
          <Alert className="border-blue-200 bg-blue-50 text-blue-900">
            <AlertTitle>Attempt is read-only</AlertTitle>
            <AlertDescription>This attempt has already been submitted, so answers are locked while marking progresses or after completion.</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:gap-8 xl:grid-cols-[19rem_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-44 lg:self-start">
            <QuestionNavigator currentQuestionId={activeQuestionId} onSelectQuestion={handleSelectQuestion} questions={navigatorQuestions} />
          </div>

          <div className="min-w-0 space-y-8">
            {orderedQuestions.map((question, index) => (
              <div className="scroll-mt-44" data-question-id={question.id} id={`question-card-${question.id}`} key={question.id}>
                <QuestionAnswerCard
                  editable={Boolean(editable)}
                  index={index}
                  isAnswered={(localAnswers[question.id] ?? '').trim().length > 0}
                  isCurrent={question.id === activeQuestionId}
                  onChange={handleAnswerChange}
                  onFocus={setCurrentQuestionId}
                  onNext={index < orderedQuestions.length - 1 ? () => handleSelectQuestion(orderedQuestions[index + 1].id) : undefined}
                  onPrevious={index > 0 ? () => handleSelectQuestion(orderedQuestions[index - 1].id) : undefined}
                  question={question}
                  totalQuestions={orderedQuestions.length}
                  value={localAnswers[question.id] ?? ''}
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
        pendingSave={saveStatus === 'dirty' || saveMutation.isPending}
        totalQuestions={orderedQuestions.length}
      />

      {(submitMutation.isPending || autoSubmitting) ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg">
            <LoaderCircle className="size-4 animate-spin" />
            {autoSubmitting ? 'Time expired — submitting automatically…' : 'Submitting attempt…'}
          </div>
        </div>
      ) : null}
    </>
  )
}
