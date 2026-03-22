import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AttemptQuestion } from '@/features/attempts/types'
import { cn } from '@/lib/utils/cn'

interface QuestionAnswerCardProps {
  question: AttemptQuestion
  index: number
  value: string
  editable: boolean
  isCurrent: boolean
  isAnswered: boolean
  onFocus: (questionId: number) => void
  onChange: (questionId: number, value: string) => void
}

export function QuestionAnswerCard({ question, index, value, editable, isCurrent, isAnswered, onFocus, onChange }: QuestionAnswerCardProps) {
  return (
    <Card className={cn('border-slate-200 transition-colors', isCurrent ? 'border-blue-300 shadow-md shadow-blue-100/70' : 'shadow-sm')}>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={isCurrent ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}>
                Question {question.questionNumber}
              </Badge>
              {question.questionKey ? <Badge className="bg-slate-100 text-slate-700">{question.questionKey}</Badge> : null}
              <Badge className="bg-slate-100 text-slate-700">{question.maxMarks} marks</Badge>
              <Badge className={isAnswered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                {isAnswered ? 'Answered' : 'Awaiting answer'}
              </Badge>
            </div>
            <CardTitle className="text-base text-slate-950 md:text-lg">Question {index + 1}</CardTitle>
          </div>
          {isCurrent ? <Badge className="bg-blue-50 text-blue-700">Current question</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.stemContext ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">{question.stemContext}</div> : null}

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">Prompt</p>
          <p className="text-sm leading-7 text-slate-700">{question.questionText}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`question-answer-${question.id}`}>Your answer</Label>
            {!editable ? <span className="text-xs text-slate-500">Locked after submission</span> : null}
          </div>
          <Textarea
            className="min-h-40 resize-y border-slate-200 bg-white"
            disabled={!editable}
            id={`question-answer-${question.id}`}
            onChange={(event) => onChange(question.id, event.target.value)}
            onFocus={() => onFocus(question.id)}
            placeholder="Write your response here..."
            value={value}
          />
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{value.trim().length} characters</span>
            <span>{question.maxMarks} max marks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
