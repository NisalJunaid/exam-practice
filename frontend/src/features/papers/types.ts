export interface PaperListItem {
  id: number
  title: string
  slug: string
  paperCode: string | null
  year: number | null
  session: string | null
  durationMinutes: number | null
  totalMarks: number
  subject: {
    id: number
    name: string
    code: string | null
    examBoard: string
    examLevel: string
  }
}

export interface PaperDetail extends Omit<PaperListItem, 'subject'> {
  instructions: string | null
  subject: {
    name: string
    code: string | null
    examBoard: string
    examLevel: string
  }
  questions: Array<{
    id: number
    questionNumber: string
    questionKey: string | null
    questionText: string
    maxMarks: number
    orderIndex: number
    stemContext: string | null
  }>
}

export interface PaperAttempt {
  id: number
  status: 'in_progress' | 'submitted' | 'marking' | 'completed' | 'failed'
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  totalAwardedMarks: number | null
  totalMaxMarks: number
  markingSummary: string | null
  paper: {
    id: number
    title: string
    subject: string
  }
  questions: Array<{
    id: number
    questionNumber: string
    questionKey: string | null
    questionText: string
    maxMarks: number
    studentAnswer: string | null
    isBlank: boolean
    review: null | {
      awardedMarks: number
      maxMarks: number
      reasoning: string
      feedback: string
      strengths: string[]
      mistakes: string[]
      referenceAnswer: string | null
      markingGuidelines: string | null
    }
  }>
}
