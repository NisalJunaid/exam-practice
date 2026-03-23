export type ImportStatus = 'uploaded' | 'processing' | 'needs_review' | 'approved' | 'failed'
export type ImportReviewStatus = 'ready' | 'needs_review' | 'missing_visual' | 'warning'
export type QuestionType = 'short_answer' | 'structured' | 'table' | 'diagram_label' | 'calculation' | 'multiple_part' | 'essay' | 'other'
export type AnswerInteractionType = 'short_text' | 'long_text' | 'select_single' | 'select_multiple' | 'multi_field' | 'table_input' | 'calculation_with_working' | 'canvas_draw' | 'graph_plot' | 'image_upload' | 'canvas_plus_text' | 'diagram_annotation' | 'matching' | 'mcq_single' | 'mcq_multiple' | 'other'
export type VisualReferenceType = 'diagram' | 'table' | 'graph' | 'chemical_structure' | 'image' | 'mixed' | null

export interface ImportItemVisualAsset {
  id: number
  assetRole: string
  disk: string
  filePath: string
  originalName: string
  mimeType: string | null
  sortOrder: number
  url: string | null
}

export interface ImportFlags {
  needsReview: boolean
  hasVisual: boolean
  lowConfidenceMatch: boolean
}

export interface ImportPreviewSummary {
  totalItems: number
  readyItems?: number
  needsReviewItems?: number
  warningItems?: number
  visualDependentItems?: number
  missingRequiredVisuals?: number
  approvedItems?: number
  overrideMissingVisuals?: boolean
}

export interface DocumentImportItem {
  id: number
  questionKey: string
  parentKey: string | null
  questionNumber: string | null
  questionType: QuestionType
  answerInteractionType: AnswerInteractionType
  interactionConfig: Record<string, unknown>
  stemContext: string | null
  questionText: string | null
  referenceAnswer: string | null
  markingGuidelines: string | null
  sampleFullMarkAnswer: string | null
  questionPaperMarks: number | null
  markSchemeMarks: number | null
  resolvedMaxMarks: number | null
  reviewStatus: ImportReviewStatus
  matchStatus: ImportReviewStatus
  requiresVisualReference: boolean
  visualReferenceType: VisualReferenceType
  visualReferenceNote: string | null
  hasVisual: boolean
  flags: ImportFlags
  pageNumber: number | null
  questionPageNumber: number | null
  markSchemePageNumber: number | null
  orderIndex: number | null
  isApproved: boolean
  adminNotes: string | null
  visualCount: number
  visualAssets: ImportItemVisualAsset[]
  rawQuestionPayload?: Record<string, unknown> | null
  rawMarkSchemePayload?: Record<string, unknown> | null
}

export interface DocumentImportPreview {
  paper?: Record<string, unknown>
  questionTypes?: Partial<Record<QuestionType, number>>
  interactionTypes?: Partial<Record<AnswerInteractionType, number>>
  counts?: ImportPreviewSummary
}

export interface DocumentImport {
  id: number
  status: ImportStatus
  inputMethod: string | null
  jsonFileName: string | null
  questionPaperName: string | null
  markSchemeName: string | null
  metadata: Record<string, unknown>
  summary: ImportPreviewSummary
  preview: DocumentImportPreview
  reviewNotes: string | null
  errorMessage: string | null
  processedAt: string | null
  approvedPaperId: number | null
  rawJsonPayload: Record<string, unknown>
  items?: DocumentImportItem[]
}
