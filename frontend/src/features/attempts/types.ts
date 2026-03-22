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

export interface AttemptResultSummary {
  attemptId: number
  status: AttemptStatus
  totalAwardedMarks: number
  totalMaxMarks: number
  percentage: number
  questions: Array<{
    questionId: number
    questionNumber: string
    awardedMarks: number
    maxMarks: number
  }>
}

export interface AttemptResult extends AttemptDetail {
  result: AttemptResultSummary
}

export interface AttemptReviewQuestion {
  questionId: number
  questionNumber: string
  questionText: string
  studentAnswer: string
  awardedMarks: number
  maxMarks: number
  reasoning: string
  feedback: string
  strengths: string[]
  mistakes: string[]
}

export interface AttemptReview extends AttemptDetail {
  review: {
    attemptId: number
    status: AttemptStatus
    totalAwardedMarks: number
    totalMaxMarks: number
    percentage: number
    questions: AttemptReviewQuestion[]
  }
}

export interface SaveAnswersPayload {
  answers: Array<{ paper_question_id: number; student_answer: string }>
}
