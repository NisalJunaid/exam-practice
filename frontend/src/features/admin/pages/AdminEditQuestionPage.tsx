import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionForm } from '@/features/admin/QuestionForm'
import { RubricForm } from '@/features/admin/RubricForm'
import { useAdminQuestion, useUpdateAdminQuestion, useUpdateQuestionRubric } from '@/features/admin/hooks'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

export function AdminEditQuestionPage() {
  const { questionId = '' } = useParams()
  const { toast } = useToast()
  const questionQuery = useAdminQuestion(questionId)
  const updateQuestion = useUpdateAdminQuestion(questionId)
  const updateRubric = useUpdateQuestionRubric(questionId)
  const [tab, setTab] = useState<'question' | 'rubric'>('question')

  const question = questionQuery.data

  async function handleQuestionSubmit(payload: Parameters<typeof updateQuestion.mutateAsync>[0]) {
    try {
      const updated = await updateQuestion.mutateAsync(payload)
      toast({ title: 'Question updated', description: `Question ${updated.questionNumber} content was saved.`, variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not update question', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  async function handleRubricSubmit(payload: Parameters<typeof updateRubric.mutateAsync>[0]) {
    try {
      await updateRubric.mutateAsync(payload)
      toast({ title: 'Rubric updated', description: 'Marker guidance was saved separately from the question text.', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not update rubric', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  if (questionQuery.isLoading) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading question…</CardContent></Card>
  }

  if (!question) {
    return <Card><CardContent className="pt-6 text-sm text-slate-600">Question not found.</CardContent></Card>
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Edit question"
        title={`Question ${question.questionNumber}`}
        description="Question content and rubric guidance live in separate tabs so authors can edit one layer without accidentally disturbing the other."
        actions={question.paper ? <Link to={routes.admin.papers.byId(question.paper.id)}><Button variant="outline">Back to paper</Button></Link> : null}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Paper</p><p className="mt-3 font-semibold">{question.paper?.title ?? '—'}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Marks</p><p className="mt-3 text-3xl font-semibold">{question.maxMarks}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Order index</p><p className="mt-3 text-3xl font-semibold">{question.orderIndex}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p><div className="mt-3"><Badge className={question.paper?.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>{question.paper?.isPublished ? 'Published paper' : 'Draft paper'}</Badge></div></CardContent></Card>
      </div>

      <Tabs onValueChange={(value) => setTab(value as 'question' | 'rubric')} value={tab}>
        <TabsList>
          <TabsTrigger value="question">Question fields</TabsTrigger>
          <TabsTrigger value="rubric">Rubric fields</TabsTrigger>
        </TabsList>
        <TabsContent value="question">
          <QuestionForm
            isSubmitting={updateQuestion.isPending}
            mode="edit"
            onSubmit={handleQuestionSubmit}
            paperTitle={question.paper?.title}
            question={question}
            submitLabel="Save question"
          />
        </TabsContent>
        <TabsContent value="rubric">
          <RubricForm
            isSubmitting={updateRubric.isPending}
            onSubmit={handleRubricSubmit}
            rubric={question.rubric}
            submitLabel="Save rubric"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
