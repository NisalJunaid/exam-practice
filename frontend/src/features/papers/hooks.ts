import { useEffect, useState } from 'react'
import { fetchAttempt, fetchPapers, saveAttemptAnswers, startAttempt, submitAttempt } from './api'
import type { PaperAttempt, PaperListItem } from './types'

export function usePapersCatalog() {
  const [data, setData] = useState<PaperListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchPapers()
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

export function usePaperAttempt(attemptId: string) {
  const [data, setData] = useState<PaperAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAttempt(attemptId)
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attemptId])

  return {
    data,
    loading,
    error,
    async saveAnswers(answers: Array<{ paper_question_id: number; student_answer: string }>) {
      const response = await saveAttemptAnswers(Number(attemptId), answers)
      setData(response)
      return response
    },
    async submit() {
      const response = await submitAttempt(Number(attemptId))
      setData(response)
      return response
    },
  }
}

export function useStartAttempt() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return {
    loading,
    error,
    async start(paperId: string) {
      setLoading(true)
      setError(null)
      try {
        return await startAttempt(paperId)
      } catch (err) {
        setError((err as Error).message)
        throw err
      } finally {
        setLoading(false)
      }
    },
  }
}
