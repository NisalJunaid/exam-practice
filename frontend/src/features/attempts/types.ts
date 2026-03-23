import type { QuestionVisualAsset } from '@/components/questions/QuestionVisualPanel'

export type AttemptStatus = 'in_progress' | 'submitted' | 'marking' | 'completed' | 'failed'
export type AnswerInteractionType =
  | 'short_text'
  | 'long_text'
  | 'select_single'
  | 'select_multiple'
  | 'multi_field'
  | 'table_input'
  | 'calculation_with_working'
  | 'canvas_draw'
  | 'graph_plot'
  | 'image_upload'
  | 'canvas_plus_text'
  | 'diagram_annotation'
  | 'matching'
  | 'mcq_single'
  | 'mcq_multiple'
  | 'other'

export interface AttemptAnswerAsset {
  id: number
  assetType: string
  disk: string
  filePath: string
  originalName: string | null
  mimeType: string | null
  metadata: Record<string, unknown>
  url: string | null
  createdAt: string | null
}

export interface AttemptStructuredAnswer {
  [key: string]: unknown
}

export interface AttemptQuestion {
  id: number
  answerId: number | null
  questionNumber: string
  questionKey: string | null
  questionText: string
  questionType: string
  answerInteractionType: AnswerInteractionType
  interactionConfig: Record<string, unknown>
  stemContext: string | null
  maxMarks: number
  requiresVisualReference: boolean
  visualReferenceType: string | null
  visualReferenceNote: string | null
  hasVisual: boolean
  visualAssets: QuestionVisualAsset[]
  studentAnswer: string | null
  structuredAnswer: AttemptStructuredAnswer | null
  answerAssets: AttemptAnswerAsset[]
  isBlank: boolean
  submittedAt: string | null
}

export interface AttemptDetail {
  id: number
  status: AttemptStatus
  startedAt: string | null
  submittedAt: string | null
  completedAt: string | null
  deadlineAt: string | null
  remainingSeconds: number | null
  isTimedOut: boolean
  totalAwardedMarks: number | null
  totalMaxMarks: number
  markingSummary: string | null
  paper: {
    id: number
    title: string
    subject: string
    paperCode: string | null
    durationMinutes: number | null
  }
  questions: AttemptQuestion[]
}

export interface SubmittedAttemptResultQuestion {
  id: number
  questionNumber: string
  questionKey: string | null
  maxMarks: number
  awardedMarks: number | null
}

export interface SubmittedAttemptResultPayload {
  status: AttemptStatus
  totalAwardedMarks: number | null
  totalMaxMarks: number
  markingSummary: string | null
  questions: SubmittedAttemptResultQuestion[]
}

export interface SubmittedAttemptDetail extends AttemptDetail {
  result: SubmittedAttemptResultPayload
}

export interface SaveAnswersPayload {
  answers: Array<{ paper_question_id: number; student_answer?: string | null; structured_answer?: AttemptStructuredAnswer | null }>
}

export interface AttemptAnswerDraft {
  studentAnswer: string
  structuredAnswer: AttemptStructuredAnswer | null
}
