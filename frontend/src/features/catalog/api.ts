import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { CatalogFilters } from './types'

export const catalogApi = {
  async filters() {
    const { data } = await apiClient.get<ApiEnvelope<CatalogFilters>>(endpoints.student.catalog)
    return data.data
  },
}
