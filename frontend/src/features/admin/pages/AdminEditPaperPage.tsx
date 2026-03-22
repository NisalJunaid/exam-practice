import { Plus, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PaperForm } from '@/features/admin/PaperForm'
import { QuestionForm } from '@/features/admin/QuestionForm'
import { RubricForm } from '@/features/admin/RubricForm'
import { useAdminPaper, useAdminSubjectOptions, useCreateAdminQuestion, usePublishPaper, useUnpublishPaper, useUpdateAdminPaper } from '@/features/admin/hooks'
import { getNextQuestionDefaults, rubricToFormValues } from '@/features/admin/utils'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

export function AdminEditPaperPage() {
  const { paperId = '' } = useParams()
  const { toast } = useToast()
  const paperQuery = useAdminPaper(paperId)
  const updatePaper = useUpdateAdminPaper(paperId)
  const publishPaper = usePublishPaper(paperId)
  const unpublishPaper = useUnpublishPaper(paperId)
  const createQuestion = useCreateAdminQuestion(paperId)
  const subjectOptionsQuery = useAdminSubjectOptions()
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [draftRubricValues, setDraftRubricValues] = useState(rubricToFormValues(null))

  function openQuestionDialog() {
    setDraftRubricValues(rubricToFormValues(null))
    setQuestionDialogOpen(true)
  }

  const paper = paperQuery.data

  async function handlePaperSubmit(payload: Parameters<typeof updatePaper.mutateAsync>[0]) {
    try {
      const updated = await updatePaper.mutateAsync(payload)
      toast({ title: 'Paper updated', description: `${updated.title} metadata was saved.`, variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not update paper', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  async function handleTogglePublish() {
    try {
      const updated = paper?.isPublished ? await unpublishPaper.mutateAsync() : await publishPaper.mutateAsync()
      toast({
        title: updated.isPublished ? 'Paper published' : 'Paper moved back to draft',
        description: updated.isPublished ? 'Students can now see this paper.' : 'The paper is no longer student-visible.',
        variant: 'success',
      })
    } catch (error) {
      toast({ title: 'Could not change publish state', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  async function handleCreateQuestion(payload: Parameters<typeof createQuestion.mutateAsync>[0]) {
    try {
      const created = await createQuestion.mutateAsync(payload)
      toast({ title: 'Question created', description: `Question ${created.questionNumber} was added to the paper.`, variant: 'success' })
      setQuestionDialogOpen(false)
      setDraftRubricValues(rubricToFormValues(null))
    } catch (error) {
      toast({ title: 'Could not create question', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  if (paperQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading paper…</CardContent></Card>
  }

  if (paperQuery.isError) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-900">
        <AlertTitle>Could not load paper</AlertTitle>
        <AlertDescription>{paperQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!paper) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Paper not found.</CardContent></Card>
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Edit paper"
        title={paper.title}
        description="Paper-level metadata stays on this page, while detailed question and rubric work remains deliberately separated for accuracy."
        actions={
          <>
            <Button onClick={openQuestionDialog} type="button" variant="outline"><Plus className="size-4" />Add question</Button>
            <Button onClick={handleTogglePublish} type="button" variant={paper.isPublished ? 'secondary' : 'default'}>
              {paper.isPublished ? 'Move to draft' : 'Publish paper'}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p><div className="mt-3"><Badge className={paper.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>{paper.isPublished ? 'Published' : 'Draft'}</Badge></div></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Questions</p><p className="mt-3 text-3xl font-semibold">{paper.questions?.length ?? paper.questionCount ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total marks</p><p className="mt-3 text-3xl font-semibold">{paper.totalMarks}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Subject</p><p className="mt-3 text-base font-semibold">{paper.subject?.name ?? '—'}</p><p className="mt-1 text-sm text-slate-500">{[paper.subject?.examBoard?.name, paper.subject?.examLevel?.name].filter(Boolean).join(' • ') || 'No board/level'}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {subjectOptionsQuery.isError ? (
            <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
              <AlertTitle>Subject suggestions unavailable</AlertTitle>
              <AlertDescription>{subjectOptionsQuery.error.message}</AlertDescription>
            </Alert>
          ) : null}
          <PaperForm
            isSubmitting={updatePaper.isPending}
            mode="edit"
            onSubmit={handlePaperSubmit}
            paper={paper}
            subjectOptions={subjectOptionsQuery.data}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question list</CardTitle>
          <CardDescription>Question records are the scoring units. Open each one to adjust detailed wording and rubric guidance independently.</CardDescription>
        </CardHeader>
        <CardContent>
          {paper.questions?.length ? (
            <div className="grid gap-3">
              {paper.questions.map((question) => (
                <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[160px_minmax(0,1fr)_120px] lg:items-start" key={question.id}>
                  <div className="space-y-2">
                    <Badge className="bg-violet-50 text-violet-700">Question {question.questionNumber}</Badge>
                    <p className="text-xs text-slate-500">Order #{question.orderIndex}{question.questionKey ? ` · ${question.questionKey}` : ''}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{question.questionText}</p>
                    <p className="mt-2 text-sm text-slate-600">{question.referenceAnswer}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>{question.maxMarks} marks</Badge>
                      <Badge className="bg-slate-100 text-slate-700">Rubric {question.rubric ? 'attached' : 'empty'}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-end lg:justify-start">
                    <Link to={routes.admin.questions.byId(question.id)}><Button type="button" variant="outline"><SquarePen className="size-4" />Edit</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Add the first question before publishing this paper." title="No questions added yet" />
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setQuestionDialogOpen} open={questionDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" onOpenChange={setQuestionDialogOpen}>
          <DialogHeader>
            <DialogTitle>Add question to {paper.title}</DialogTitle>
            <DialogDescription>Create the question payload first. Optional rubric data can be drafted in the same dialog and will be sent in the nested create request the backend supports.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 px-6 pb-6">
            <QuestionForm
              defaultValues={getNextQuestionDefaults(paper)}
              includeRubricHint
              isSubmitting={createQuestion.isPending}
              mode="create"
              onCancel={() => setQuestionDialogOpen(false)}
              onSubmit={handleCreateQuestion}
              paperTitle={paper.title}
              rubricValues={draftRubricValues}
              submitLabel="Create question"
            />
            <RubricForm key={questionDialogOpen ? 'draft-rubric-open' : 'draft-rubric-closed'} onValuesChange={setDraftRubricValues} showSubmitButton={false} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
