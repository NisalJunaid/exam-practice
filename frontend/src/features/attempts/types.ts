import type { QuestionVisualAsset } from '@/components/questions/QuestionVisualPanel'

export type AttemptStatus = 'in_progress' | 'submitted' | 'marking' | 'completed' | 'failed'

export interface AttemptQuestion {
  id: number
  questionNumber: string
  questionKey: string | null
  questionText: string
  stemContext: string | null
  maxMarks: number
  requiresVisualReference: boolean
  visualReferenceType: string | null
  visualReferenceNote: string | null
  hasVisual: boolean
  visualAssets: QuestionVisualAsset[]
  studentAnswer: string | null
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
  answers: Array<{ paper_question_id: number; student_answer: string }>
}
