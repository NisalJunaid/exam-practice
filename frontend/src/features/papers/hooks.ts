import { useQuery } from '@tanstack/react-query'

import type { CatalogSearchParams } from '@/features/catalog/types'
import { papersApi } from '@/features/papers/api'
import { queryKeys } from '@/lib/constants/queryKeys'

export function usePaperList(filters: CatalogSearchParams) {
  return useQuery({
    queryKey: queryKeys.papers.list(filters),
    queryFn: () => papersApi.list(filters),
  })
}

export function usePaperDetail(paperId: string) {
  return useQuery({
    queryKey: queryKeys.papers.detail(paperId),
    queryFn: () => papersApi.detail(paperId),
    enabled: Boolean(paperId),
  })
}
