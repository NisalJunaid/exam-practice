import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

export interface NavigatorQuestionItem {
  id: number
  questionNumber: string
  maxMarks: number
  answered: boolean
}

interface QuestionNavigatorProps {
  questions: NavigatorQuestionItem[]
  currentQuestionId: number | null
  onSelectQuestion: (questionId: number) => void
}

export function QuestionNavigator({ questions, currentQuestionId, onSelectQuestion }: QuestionNavigatorProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Question navigator</CardTitle>
          <Badge className="bg-slate-100 text-slate-700">{questions.length}</Badge>
        </div>
        <p className="text-sm text-slate-500">Use this left rail to move quickly between questions during the paper.</p>
      </CardHeader>
      <CardContent className="grid gap-2">
        {questions.map((question, index) => {
          const isCurrent = question.id === currentQuestionId
          return (
            <Button
              key={question.id}
              className={cn(
                'h-auto justify-between rounded-2xl border px-3 py-3 text-left',
                isCurrent
                  ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
                  : question.answered
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
              onClick={() => onSelectQuestion(question.id)}
              type="button"
              variant="outline"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.18em] opacity-70">{index + 1}</span>
                <span className="block text-sm font-semibold">Question {question.questionNumber}</span>
                <span className="block text-xs opacity-80">{question.maxMarks} marks</span>
              </span>
              <span className="text-xs font-medium uppercase tracking-wide">{isCurrent ? 'Current' : question.answered ? 'Answered' : 'Open'}</span>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
