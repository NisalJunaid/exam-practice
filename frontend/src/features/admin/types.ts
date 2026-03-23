import type { QuestionVisualAsset } from '@/components/questions/QuestionVisualPanel'

export type AnswerInteractionType = 'short_text' | 'long_text' | 'select_single' | 'select_multiple' | 'multi_field' | 'table_input' | 'calculation_with_working' | 'canvas_draw' | 'graph_plot' | 'image_upload' | 'canvas_plus_text' | 'diagram_annotation' | 'matching' | 'mcq_single' | 'mcq_multiple' | 'other'
export type QuestionType = 'short_answer' | 'structured' | 'table' | 'diagram_label' | 'calculation' | 'multiple_part' | 'essay' | 'other'

export interface AdminPaperSubject {
  id: number
  name: string
  slug: string
  code: string | null
  examBoard: { id: number; name: string; slug: string } | null
  examLevel: { id: number; name: string; slug: string } | null
}

export interface AdminQuestionRubric {
  id: number
  bandDescriptor: string | null
  keywordsExpected: string[]
  commonMistakes: string[]
  acceptableAlternatives: string[]
  markerNotes: string | null
}

export interface AdminQuestionPaperSummary {
  id: number
  title: string
  slug: string
  isPublished: boolean
  totalMarks: number
}

export interface AdminQuestion {
  id: number
  paperId: number
  questionNumber: string
  questionKey: string | null
  questionType: QuestionType
  answerInteractionType: AnswerInteractionType
  interactionConfig: Record<string, unknown>
  questionText: string
  referenceAnswer: string
  maxMarks: number
  markingGuidelines: string | null
  sampleFullMarkAnswer: string | null
  orderIndex: number
  stemContext: string | null
  requiresVisualReference?: boolean
  visualReferenceType?: string | null
  visualReferenceNote?: string | null
  hasVisual?: boolean
  visualAssets: QuestionVisualAsset[]
  rubric?: AdminQuestionRubric | null
  paper?: AdminQuestionPaperSummary | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AdminPaper {
  id: number
  title: string
  slug: string
  paperCode: string | null
  year: number | null
  session: string | null
  durationMinutes: number | null
  totalMarks: number
  instructions: string | null
  isPublished: boolean
  questionCount?: number
  sourceQuestionPaperPath: string | null
  sourceMarkSchemePath: string | null
  subject: AdminPaperSubject | null
  questions?: AdminQuestion[]
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminPaperPayload {
  subject_id: number
  title: string
  slug?: string | null
  paper_code?: string | null
  year?: number | null
  session?: string | null
  duration_minutes?: number | null
  total_marks?: number | null
  instructions?: string | null
  is_published?: boolean
  source_question_paper_path?: string | null
  source_mark_scheme_path?: string | null
}

export interface AdminQuestionRubricPayload {
  band_descriptor?: string | null
  keywords_expected?: string[] | null
  common_mistakes?: string[] | null
  acceptable_alternatives?: string[] | null
  marker_notes?: string | null
}

export interface AdminQuestionPayload {
  question_number?: string | null
  question_key?: string | null
  question_type?: QuestionType
  answer_interaction_type?: AnswerInteractionType
  interaction_config?: Record<string, unknown>
  question_text: string
  reference_answer: string
  max_marks: number
  marking_guidelines?: string | null
  sample_full_mark_answer?: string | null
  order_index: number
  stem_context?: string | null
  requires_visual_reference?: boolean
  visual_reference_type?: string | null
  visual_reference_note?: string | null
  visual_assets?: Array<{ id: number; alt_text?: string | null; caption?: string | null; sort_order?: number; is_deleted?: boolean }>
  rubric?: AdminQuestionRubricPayload
}

export interface AdminPaperFormValues {
  subject_id: number
  title: string
  slug: string
  paper_code: string
  year: string
  session: string
  duration_minutes: string
  total_marks: string
  instructions: string
}

export interface AdminQuestionFormValues {
  question_number: string
  question_key: string
  question_type: QuestionType
  answer_interaction_type: AnswerInteractionType
  interaction_config: string
  question_text: string
  reference_answer: string
  max_marks: string
  marking_guidelines: string
  sample_full_mark_answer: string
  order_index: string
  stem_context: string
  requires_visual_reference: boolean
  visual_reference_type: string
  visual_reference_note: string
}

export interface AdminRubricFormValues {
  band_descriptor: string
  keywords_expected: string
  common_mistakes: string
  acceptable_alternatives: string
  marker_notes: string
}

export interface AdminSubjectOption {
  id: number
  label: string
  helper: string
}
