import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { AttemptResult, AttemptReview } from './types'

export const reviewApi = {
  async results(attemptId: string) {
    const { data } = await apiClient.get<ApiEnvelope<AttemptResult>>(endpoints.student.attempts.results(attemptId))
    return data.data
  },
  async review(attemptId: string) {
    const { data } = await apiClient.get<ApiEnvelope<AttemptReview>>(endpoints.student.attempts.review(attemptId))
    return data.data
  },
}
