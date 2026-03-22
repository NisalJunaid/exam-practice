import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { AdminPaper, AdminPaperPayload, AdminQuestion, AdminQuestionPayload } from './types'

export const adminApi = {
  async papers() {
    const { data } = await apiClient.get<ApiEnvelope<AdminPaper[]>>(endpoints.admin.papers)
    return data.data
  },
  async paper(paperId: string) {
    const { data } = await apiClient.get<ApiEnvelope<AdminPaper>>(endpoints.admin.paper(paperId))
    return data.data
  },
  async createPaper(payload: AdminPaperPayload) {
    const { data } = await apiClient.post<ApiEnvelope<AdminPaper>>(endpoints.admin.papers, payload)
    return data.data
  },
  async updatePaper(paperId: string, payload: Partial<AdminPaperPayload>) {
    const { data } = await apiClient.put<ApiEnvelope<AdminPaper>>(endpoints.admin.paper(paperId), payload)
    return data.data
  },
  async publishPaper(paperId: string) {
    const { data } = await apiClient.post<ApiEnvelope<AdminPaper>>(endpoints.admin.publish(paperId))
    return data.data
  },
  async question(questionId: string) {
    const { data } = await apiClient.get<ApiEnvelope<AdminQuestion>>(endpoints.admin.question(questionId))
    return data.data
  },
  async updateQuestion(questionId: string, payload: Partial<AdminQuestionPayload>) {
    const { data } = await apiClient.put<ApiEnvelope<AdminQuestion>>(endpoints.admin.question(questionId), payload)
    return data.data
  },
}
