import { useQuery } from '@tanstack/react-query'

import { catalogApi } from '@/features/catalog/api'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useCatalogFilters() {
  return useQuery({
    queryKey: queryKeys.catalog.filters,
    queryFn: catalogApi.filters,
  })
}
