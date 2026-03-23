import type { QuestionVisualAsset } from '@/components/questions/QuestionVisualPanel'
import type { AttemptAnswerAsset, AttemptDetail, AttemptStatus, AttemptStructuredAnswer } from '@/features/attempts/types'

export interface AttemptResultQuestion {
  id: number
  questionNumber: string
  questionKey: string | null
  maxMarks: number
  awardedMarks: number | null
}

export interface AttemptResultPayload {
  status: AttemptStatus
  totalAwardedMarks: number | null
  totalMaxMarks: number
  markingSummary: string | null
  questions: AttemptResultQuestion[]
}

export interface AttemptResult extends AttemptDetail {
  result: AttemptResultPayload
}

export interface AttemptReviewQuestion {
  id: number
  questionNumber: string
  questionKey: string | null
  questionText: string
  questionType: string
  answerInteractionType: string
  interactionConfig: Record<string, unknown>
  stemContext: string | null
  visualAssets: QuestionVisualAsset[]
  studentAnswer: string | null
  structuredAnswer: AttemptStructuredAnswer | null
  answerAssets: AttemptAnswerAsset[]
  isBlank: boolean
  awardedMarks: number | null
  maxMarks: number
  reasoning: string | null
  feedback: string | null
  strengths: string[]
  mistakes: string[]
  referenceAnswer: string | null
  markingGuidelines: string | null
}

export interface AttemptReviewPayload {
  markingSummary: string | null
  questions: AttemptReviewQuestion[]
}

export interface AttemptReview extends AttemptDetail {
  review: AttemptReviewPayload
}
