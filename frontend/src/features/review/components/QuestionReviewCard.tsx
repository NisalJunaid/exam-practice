import { QuestionVisualPanel } from '@/components/questions/QuestionVisualPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { AttemptReviewQuestion } from '../types'
import { FeedbackPanel } from './FeedbackPanel'
import { MarkBreakdownBadge } from './MarkBreakdownBadge'

interface QuestionReviewCardProps {
  question: AttemptReviewQuestion
}

function renderLongText(value: string | null | undefined, fallback: string) {
  if (!value || !value.trim()) {
    return <p className="text-sm text-slate-500">{fallback}</p>
  }

  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</p>
}

function StructuredAnswerBlock({ question }: { question: AttemptReviewQuestion }) {
  const structured = question.structuredAnswer ?? {}

  if (question.answerAssets.length) {
    return (
      <div className="grid gap-3">
        <div className="flex flex-wrap gap-3">
          {question.answerAssets.map((asset) => asset.url ? <img alt={asset.originalName ?? 'Submitted answer'} className="max-h-80 rounded-2xl border border-slate-200 object-contain" key={asset.id} src={asset.url} /> : null)}
        </div>
        {structured.notes ? <p className="whitespace-pre-wrap text-sm text-slate-700">{String(structured.notes)}</p> : null}
        {structured.text ? <p className="whitespace-pre-wrap text-sm text-slate-700">{String(structured.text)}</p> : null}
      </div>
    )
  }

  if (question.answerInteractionType === 'multi_field' && structured.fields && typeof structured.fields === 'object') {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(structured.fields as Record<string, string>).map(([key, value]) => (
          <div className="rounded-xl border border-slate-200 p-3" key={key}>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{value || '—'}</p>
          </div>
        ))}
      </div>
    )
  }

  if (question.answerInteractionType === 'table_input' && structured.rows && typeof structured.rows === 'object') {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Answer</TableHead></TableRow></TableHeader>
          <TableBody>
            {Object.entries(structured.rows as Record<string, string>).map(([key, value]) => (
              <TableRow key={key}><TableCell>{key}</TableCell><TableCell>{value || '—'}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (question.answerInteractionType === 'calculation_with_working') {
    return (
      <div className="grid gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Final answer</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{String(structured.final_answer ?? '—')}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Working</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{String(structured.working ?? '—')}</p>
        </div>
      </div>
    )
  }

  return renderLongText(question.studentAnswer, 'No answer was submitted for this question.')
}

export function QuestionReviewCard({ question }: QuestionReviewCardProps) {
  const heading = question.questionKey ? `${question.questionKey} · Question ${question.questionNumber}` : `Question ${question.questionNumber}`

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-slate-100 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl">{heading}</CardTitle>
          <p className="text-sm text-slate-500">Read the question and your answer first, then expand the feedback sections below.</p>
        </div>
        <MarkBreakdownBadge awardedMarks={question.awardedMarks} className="w-fit" maxMarks={question.maxMarks} />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Question prompt</p>
          {question.stemContext ? <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500">{question.stemContext}</p> : null}
          <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-slate-900">{question.questionText}</p>
        </div>

        <QuestionVisualPanel compact visuals={question.visualAssets} />

        <details className="rounded-2xl border border-slate-200" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">Student answer</summary>
          <div className="border-t border-slate-100 px-4 py-4"><StructuredAnswerBlock question={question} /></div>
        </details>

        <details className="rounded-2xl border border-slate-200" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">Marker reasoning</summary>
          <div className="border-t border-slate-100 px-4 py-4">{renderLongText(question.reasoning, 'Reasoning was not provided for this question.')}</div>
        </details>

        <details className="rounded-2xl border border-slate-200" open>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">Improvement feedback</summary>
          <div className="border-t border-slate-100 px-4 py-4">{renderLongText(question.feedback, 'No additional improvement feedback was returned.')}</div>
        </details>

        <div className="grid gap-4 lg:grid-cols-2">
          <FeedbackPanel emptyLabel="No strengths were highlighted for this answer." items={question.strengths} title="Strengths" tone="positive" />
          <FeedbackPanel emptyLabel="No mistakes were listed for this answer." items={question.mistakes} title="Mistakes" tone="negative" />
        </div>
      </CardContent>
    </Card>
  )
}
