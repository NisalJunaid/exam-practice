export interface CatalogOption {
  id: number
  name: string
  slug: string
}

export interface CatalogSubject extends CatalogOption {
  code: string | null
  examBoardId: number
  examBoard: string | null
  examLevelId: number
  examLevel: string | null
}

export interface CatalogFilters {
  examBoards: CatalogOption[]
  examLevels: CatalogOption[]
  subjects: CatalogSubject[]
  years: number[]
  sessions: string[]
}

export interface CatalogSearchParams {
  exam_board_id?: string
  exam_level_id?: string
  subject_id?: string
  year?: string
  session?: string
  q?: string
}

export interface FilterFieldOption {
  label: string
  value: string
}
