export type AttemptStatus = 'in_progress' | 'submitted' | 'marking' | 'completed' | 'failed'

export interface AttemptQuestion {
  id: number
  questionNumber: string
  questionKey: string | null
  questionText: string
  stemContext: string | null
  maxMarks: number
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
  totalAwardedMarks: number | null
  totalMaxMarks: number
  markingSummary: string | null
  paper: {
    id: number
    title: string
    subject: string
    paperCode: string | null
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
