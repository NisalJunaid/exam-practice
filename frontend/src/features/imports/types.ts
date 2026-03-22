export type ImportStatus = 'uploaded' | 'processing' | 'needs_review' | 'approved' | 'failed'
export type ImportMatchStatus = 'matched' | 'paper_only' | 'scheme_only' | 'ambiguous' | 'resolved'

export interface ImportSourceFile {
  id: number
  role: string
  disk: string
  path: string
  originalName: string
  mimeType: string
  sizeBytes: number
  paperId: number | null
}

export interface DocumentImportItem {
  id: number
  questionKey: string
  parentKey: string | null
  questionNumber: string | null
  stemContext: string | null
  questionText: string | null
  referenceAnswer: string | null
  markingGuidelines: string | null
  questionPaperMarks: number | null
  markSchemeMarks: number | null
  resolvedMaxMarks: number | null
  matchStatus: ImportMatchStatus
  pageNumber: number | null
  questionPageNumber: number | null
  markSchemePageNumber: number | null
  orderIndex: number | null
  isApproved: boolean
  adminNotes: string | null
  rawQuestionPayload?: Record<string, unknown> | null
  rawMarkSchemePayload?: Record<string, unknown> | null
}

export interface DocumentImport {
  id: number
  status: ImportStatus
  questionPaperName: string | null
  markSchemeName: string | null
  metadata: Record<string, unknown>
  summary: Record<string, number>
  reviewNotes: string | null
  errorMessage: string | null
  processedAt: string | null
  approvedPaperId: number | null
  rawExtractionPayload: Record<string, unknown>
  sourceFiles?: ImportSourceFile[]
  items?: DocumentImportItem[]
}
