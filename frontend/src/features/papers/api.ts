import { apiFetch } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'
import type { PaperAttempt, PaperDetail, PaperListItem } from './types'

export async function fetchPapers() {
  const response = await apiFetch<ApiEnvelope<PaperListItem[]>>('/student/papers')
  return response.data
}

export async function fetchPaper(paperId: string) {
  const response = await apiFetch<ApiEnvelope<PaperDetail>>(`/student/papers/${paperId}`)
  return response.data
}

export async function startAttempt(paperId: string) {
  const response = await apiFetch<ApiEnvelope<PaperAttempt>>(`/student/papers/${paperId}/attempts`, {
    method: 'POST',
  })
  return response.data
}

export async function fetchAttempt(attemptId: string) {
  const response = await apiFetch<ApiEnvelope<PaperAttempt>>(`/student/attempts/${attemptId}`)
  return response.data
}

export async function saveAttemptAnswers(attemptId: number, answers: Array<{ paper_question_id: number; student_answer: string }>) {
  const response = await apiFetch<ApiEnvelope<PaperAttempt>>(`/student/attempts/${attemptId}/answers`, {
    method: 'PUT',
    body: JSON.stringify({ answers }),
  })
  return response.data
}

export async function submitAttempt(attemptId: number) {
  const response = await apiFetch<ApiEnvelope<PaperAttempt>>(`/student/attempts/${attemptId}/submit`, {
    method: 'POST',
  })
  return response.data
}
