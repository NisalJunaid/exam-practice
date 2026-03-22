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

export interface AdminQuestion {
  id: number
  paperId: number
  questionNumber: string
  questionKey: string | null
  questionText: string
  referenceAnswer: string
  maxMarks: number
  markingGuidelines: string | null
  sampleFullMarkAnswer: string | null
  orderIndex: number
  stemContext: string | null
  rubric?: AdminQuestionRubric | null
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
  slug: string
  paper_code?: string
  year?: number
  session?: string
  duration_minutes?: number
  total_marks: number
  instructions?: string
  is_published?: boolean
}

export interface AdminQuestionPayload {
  question_number: string
  question_key?: string
  question_text: string
  reference_answer: string
  max_marks: number
  marking_guidelines?: string
  sample_full_mark_answer?: string
  order_index: number
  stem_context?: string
}
