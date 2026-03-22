import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type {
  AdminPaper,
  AdminPaperPayload,
  AdminQuestion,
  AdminQuestionPayload,
  AdminQuestionRubricPayload,
} from './types'

export const adminApi = {
  async papers() {
    const { data } = await apiClient.get<ApiEnvelope<AdminPaper[]>>(endpoints.admin.papers)
    return data.data
  },
  async paper(paperId: string | number) {
    const { data } = await apiClient.get<ApiEnvelope<AdminPaper>>(endpoints.admin.paper(paperId))
    return data.data
  },
  async createPaper(payload: AdminPaperPayload) {
    const { data } = await apiClient.post<ApiEnvelope<AdminPaper>>(endpoints.admin.papers, payload)
    return data.data
  },
  async updatePaper(paperId: string | number, payload: Partial<AdminPaperPayload>) {
    const { data } = await apiClient.put<ApiEnvelope<AdminPaper>>(endpoints.admin.paper(paperId), payload)
    return data.data
  },
  async publishPaper(paperId: string | number) {
    const { data } = await apiClient.post<ApiEnvelope<AdminPaper>>(endpoints.admin.publish(paperId))
    return data.data
  },
  async unpublishPaper(paperId: string | number) {
    const { data } = await apiClient.post<ApiEnvelope<AdminPaper>>(endpoints.admin.unpublish(paperId))
    return data.data
  },
  async question(questionId: string | number) {
    const { data } = await apiClient.get<ApiEnvelope<AdminQuestion>>(endpoints.admin.question(questionId))
    return data.data
  },
  async createQuestion(paperId: string | number, payload: AdminQuestionPayload) {
    const { data } = await apiClient.post<ApiEnvelope<AdminQuestion>>(endpoints.admin.createQuestion(paperId), payload)
    return data.data
  },
  async updateQuestion(questionId: string | number, payload: Partial<AdminQuestionPayload>) {
    const { data } = await apiClient.put<ApiEnvelope<AdminQuestion>>(endpoints.admin.question(questionId), payload)
    return data.data
  },
  async updateRubric(questionId: string | number, payload: AdminQuestionRubricPayload) {
    const { data } = await apiClient.put<ApiEnvelope<AdminQuestion>>(endpoints.admin.updateRubric(questionId), payload)
    return data.data
  },
}
