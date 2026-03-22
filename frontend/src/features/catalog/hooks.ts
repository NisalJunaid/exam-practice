import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { catalogApi } from '@/features/catalog/api'
import type { CatalogFilters } from '@/features/catalog/types'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useCatalogFilters() {
  return useQuery({
    queryKey: queryKeys.catalog.filters,
    queryFn: catalogApi.filters,
  })
}

export function useCatalogFilterOptions(catalog?: CatalogFilters) {
  return useMemo(() => {
    if (!catalog) {
      return {
        boards: [],
        levels: [],
        subjects: [],
        years: [],
        sessions: [],
      }
    }

    return {
      boards: catalog.examBoards.map((board) => ({ label: board.name, value: String(board.id) })),
      levels: catalog.examLevels.map((level) => ({ label: level.name, value: String(level.id) })),
      subjects: catalog.subjects.map((subject) => ({
        label: `${subject.name}${subject.code ? ` (${subject.code})` : ''}`,
        value: String(subject.id),
      })),
      years: catalog.years.map((year) => ({ label: String(year), value: String(year) })),
      sessions: catalog.sessions.map((session) => ({ label: session, value: session })),
    }
  }, [catalog])
}
