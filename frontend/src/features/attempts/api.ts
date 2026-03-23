import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { AttemptAnswerAsset, AttemptDetail, SaveAnswersPayload, SubmittedAttemptDetail } from './types'

export const attemptsApi = {
  async create(paperId: string) {
    const { data } = await apiClient.post<ApiEnvelope<AttemptDetail>>(endpoints.student.attempts.create(paperId))
    return data.data
  },
  async detail(attemptId: string) {
    const { data } = await apiClient.get<ApiEnvelope<AttemptDetail>>(endpoints.student.attempts.detail(attemptId))
    return data.data
  },
  async saveAnswers(attemptId: string, payload: SaveAnswersPayload) {
    const { data } = await apiClient.put<ApiEnvelope<AttemptDetail>>(endpoints.student.attempts.answers(attemptId), payload)
    return data.data
  },
  async uploadAnswerAsset(attemptId: string, formData: FormData) {
    const { data } = await apiClient.post<ApiEnvelope<AttemptAnswerAsset>>(endpoints.student.attempts.answerAssets(attemptId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },
  async submit(attemptId: string) {
    const { data } = await apiClient.post<ApiEnvelope<SubmittedAttemptDetail>>(endpoints.student.attempts.submit(attemptId))
    return data.data
  },
}
