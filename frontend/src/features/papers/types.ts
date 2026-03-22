import type { AttemptDetail } from '@/features/attempts/types'

export interface PaperSubjectSummary {
  id: number
  name: string
  code: string | null
  examBoard: string
  examLevel: string
}

export interface PaperListItem {
  id: number
  title: string
  slug: string
  paperCode: string | null
  year: number | null
  session: string | null
  durationMinutes: number | null
  totalMarks: number
  subject: PaperSubjectSummary
}

export interface PaperQuestionSummary {
  id: number
  questionNumber: string
  questionKey: string | null
  questionText: string
  maxMarks: number
  orderIndex: number
  stemContext: string | null
}

export interface PaperDetail extends PaperListItem {
  instructions: string | null
  questions: PaperQuestionSummary[]
}

export type StartAttemptResponse = AttemptDetail
