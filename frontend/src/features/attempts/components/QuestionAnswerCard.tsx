import { ChevronLeft, ChevronRight } from 'lucide-react'

import { QuestionVisualPanel } from '@/components/questions/QuestionVisualPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AttemptQuestion } from '@/features/attempts/types'
import { cn } from '@/lib/utils/cn'

interface QuestionAnswerCardProps {
  question: AttemptQuestion
  index: number
  totalQuestions: number
  value: string
  editable: boolean
  isCurrent: boolean
  isAnswered: boolean
  onFocus: (questionId: number) => void
  onChange: (questionId: number, value: string) => void
  onPrevious?: () => void
  onNext?: () => void
}

export function QuestionAnswerCard({ question, index, totalQuestions, value, editable, isCurrent, isAnswered, onFocus, onChange, onPrevious, onNext }: QuestionAnswerCardProps) {
  return (
    <Card className={cn('border-slate-200 bg-white', isCurrent ? 'border-blue-200 shadow-md shadow-blue-100/60' : 'shadow-sm')}>
      <CardHeader className="gap-4 border-b border-slate-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={isCurrent ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}>Question {index + 1} of {totalQuestions}</Badge>
              <Badge className="bg-slate-100 text-slate-700">Number {question.questionNumber}</Badge>
              {question.questionKey ? <Badge className="bg-slate-100 text-slate-700">{question.questionKey}</Badge> : null}
              <Badge className="bg-slate-100 text-slate-700">{question.maxMarks} marks</Badge>
              <Badge className={isAnswered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>{isAnswered ? 'Answered' : 'Awaiting answer'}</Badge>
            </div>
            <div>
              <CardTitle className="text-xl leading-tight text-slate-950">Question {question.questionNumber}</CardTitle>
              {question.stemContext ? <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600">{question.stemContext}</p> : null}
            </div>
          </div>
          {isCurrent ? <Badge className="w-fit bg-blue-50 text-blue-700">Current question</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-6">
        <div className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prompt</p>
          <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">{question.questionText}</p>
          {question.visualReferenceNote ? <p className="text-sm leading-6 text-slate-500">{question.visualReferenceNote}</p> : null}
        </div>

        <QuestionVisualPanel compact visuals={question.visualAssets} />

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`question-answer-${question.id}`}>Your answer</Label>
            {!editable ? <span className="text-xs text-slate-500">Locked after submission</span> : null}
          </div>
          <Textarea
            className="min-h-[18rem] resize-y border-slate-200 bg-white text-base leading-7"
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

        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4">
          <Button disabled={!onPrevious} onClick={onPrevious} type="button" variant="outline">
            <ChevronLeft className="size-4" /> Previous question
          </Button>
          <Button disabled={!onNext} onClick={onNext} type="button" variant="outline">
            Next question <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
