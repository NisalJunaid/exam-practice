import { Clock3, Play } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateAttempt } from '@/features/attempts/hooks'
import { usePaperDetail } from '@/features/papers/hooks'
import { routes } from '@/lib/constants/routes'

export function PaperDetailPage() {
  const navigate = useNavigate()
  const { paperId = '' } = useParams()
  const paperQuery = usePaperDetail(paperId)
  const createAttempt = useCreateAttempt()

  async function handleStartAttempt() {
    const attempt = await createAttempt.mutateAsync(paperId)
    navigate(routes.attempts.takeById(attempt.id))
  }

  if (paperQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading paper…</CardContent></Card>
  }

  if (!paperQuery.data) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Paper not found.</CardContent></Card>
  }

  const paper = paperQuery.data

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={paper.subject.examBoard}
        title={paper.title}
        description={paper.instructions ?? 'Instructions are not yet available. The shell still exposes stable metadata, question previews, and attempt launching.'}
        actions={
          <Button disabled={createAttempt.isPending} onClick={() => void handleStartAttempt()}>
            <Play className="size-4" />
            {createAttempt.isPending ? 'Starting…' : 'Start attempt'}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6 text-sm"><span className="font-medium">Subject:</span> {paper.subject.name}</CardContent></Card>
        <Card><CardContent className="pt-6 text-sm"><span className="font-medium">Paper code:</span> {paper.paperCode ?? '—'}</CardContent></Card>
        <Card><CardContent className="pt-6 text-sm"><span className="font-medium">Total marks:</span> {paper.totalMarks}</CardContent></Card>
        <Card><CardContent className="flex items-center gap-2 pt-6 text-sm"><Clock3 className="size-4 text-slate-500" /> {paper.durationMinutes ?? 'TBC'} minutes</CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question outline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {paper.questions.map((question) => (
            <div key={question.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Question {question.questionNumber}{question.questionKey ? ` · ${question.questionKey}` : ''}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{question.questionText}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{question.maxMarks} marks</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Link className="text-sm font-medium text-blue-700" to={routes.papers.index}>← Back to catalog</Link>
    </div>
  )
}
