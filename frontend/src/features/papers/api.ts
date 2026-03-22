import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { CatalogSearchParams } from '@/features/catalog/types'
import type { PaperDetail, PaperListItem, StartAttemptResponse } from './types'

export const papersApi = {
  async list(filters: CatalogSearchParams) {
    const { data } = await apiClient.get<ApiEnvelope<PaperListItem[]>>(endpoints.student.papers, { params: filters })
    return data.data
  },
  async detail(paperId: string | number) {
    const { data } = await apiClient.get<ApiEnvelope<PaperDetail>>(endpoints.student.paper(paperId))
    return data.data
  },
  async startAttempt(paperId: string | number) {
    const { data } = await apiClient.post<ApiEnvelope<StartAttemptResponse>>(endpoints.student.attempts.create(paperId))
    return data.data
  },
}
