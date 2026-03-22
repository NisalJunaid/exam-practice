export type MatchStatus = 'matched' | 'paper_only' | 'scheme_only' | 'ambiguous' | 'resolved'

export interface DocumentImportItem {
  id: number
  questionKey: string
  questionNumber: string | null
  questionText: string
  referenceAnswer: string | null
  markingGuidelines: string | null
  questionPaperMarks: number | null
  markSchemeMarks: number | null
  resolvedMaxMarks: number | null
  matchStatus: MatchStatus
  pageNumber: number | null
  orderIndex: number
  isApproved: boolean
  adminNotes: string | null
}

export interface DocumentImport {
  id: number
  status: 'uploaded' | 'processing' | 'needs_review' | 'approved' | 'failed'
  questionPaperName: string
  markSchemeName: string
  metadata: Record<string, string | number | null>
  summary: Record<string, number>
  reviewNotes: string | null
  processedAt: string | null
  approvedPaperId: number | null
  items?: DocumentImportItem[]
}
