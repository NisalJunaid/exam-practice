import { AlertCircle, ArrowLeft, Clock3, FileText, Play, ScrollText } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaperDetailSkeleton } from '@/features/papers/components/PaperDetailSkeleton'
import { usePaperDetail, useStartAttempt } from '@/features/papers/hooks'
import { routes } from '@/lib/constants/routes'

export function PaperDetailPage() {
  const navigate = useNavigate()
  const { paperId = '' } = useParams()
  const paperQuery = usePaperDetail(paperId)
  const startAttempt = useStartAttempt()

  async function handleStartAttempt() {
    const attempt = await startAttempt.mutateAsync(paperId)
    navigate(routes.attempts.takeById(attempt.id))
  }

  if (paperQuery.isLoading) {
    return <PaperDetailSkeleton />
  }

  if (paperQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-700">
        <AlertTitle>Unable to load paper detail</AlertTitle>
        <AlertDescription>{paperQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!paperQuery.data) {
    return (
      <EmptyState
        title="Paper not found"
        description="This paper may have been removed or is no longer published."
        icon={<AlertCircle className="size-5" />}
        action={<Button variant="outline" onClick={() => navigate(routes.papers.index)}>Back to catalog</Button>}
      />
    )
  }

  const paper = paperQuery.data

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={paper.subject.examBoard}
        title={paper.title}
        description={paper.instructions ?? 'Read the paper metadata and question outline below before beginning your attempt.'}
        actions={
          <Button disabled={startAttempt.isPending} onClick={() => void handleStartAttempt()}>
            <Play className="size-4" />
            {startAttempt.isPending ? 'Starting…' : 'Start attempt'}
          </Button>
        }
      />

      {startAttempt.isError ? (
        <Alert className="border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Could not start attempt</AlertTitle>
          <AlertDescription>{startAttempt.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-blue-50 text-blue-700">{paper.subject.name}</Badge>
        <Badge>{paper.subject.examLevel}</Badge>
        {paper.paperCode ? <Badge className="bg-slate-900 text-white">{paper.paperCode}</Badge> : null}
        {paper.session || paper.year ? <Badge className="bg-slate-100 text-slate-700">{paper.session ?? 'Session TBC'} {paper.year ?? ''}</Badge> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-slate-700">
            <FileText className="size-4 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Subject</p>
              <p>{paper.subject.name}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-slate-700">
            <ScrollText className="size-4 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Total marks</p>
              <p>{paper.totalMarks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-slate-700">
            <Clock3 className="size-4 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Duration</p>
              <p>{paper.durationMinutes ? `${paper.durationMinutes} minutes` : 'To be confirmed'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-slate-700">
            <Play className="size-4 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Questions</p>
              <p>{paper.questions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
            <p>{paper.instructions ?? 'No specific instructions were provided for this paper yet.'}</p>
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-900">
              <p className="font-medium">Ready to begin?</p>
              <p className="mt-1 text-sm">Use the Start attempt button to create a new student attempt from this paper.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question outline</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {paper.questions.length ? paper.questions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">
                      Question {question.questionNumber}
                      {question.questionKey ? ` · ${question.questionKey}` : ''}
                    </p>
                    {question.stemContext ? <p className="text-sm text-slate-500">{question.stemContext}</p> : null}
                    <p className="text-sm leading-6 text-slate-600">{question.questionText}</p>
                  </div>
                  <div className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {question.maxMarks} marks
                  </div>
                </div>
              </div>
            )) : (
              <EmptyState
                title="No question summaries available"
                description="This paper has no question outline yet, but you can still return to the catalog to browse other papers."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Link className="inline-flex items-center gap-2 text-sm font-medium text-blue-700" to={routes.papers.index}>
        <ArrowLeft className="size-4" />
        Back to catalog
      </Link>
    </div>
  )
}
