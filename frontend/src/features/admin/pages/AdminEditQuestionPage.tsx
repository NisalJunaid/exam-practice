import { ArrowDown, ArrowUp, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { QuestionVisualPanel, type QuestionVisualAsset } from '@/components/questions/QuestionVisualPanel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionForm } from '@/features/admin/QuestionForm'
import { RubricForm } from '@/features/admin/RubricForm'
import { useAdminQuestion, useUpdateAdminQuestion, useUpdateQuestionRubric } from '@/features/admin/hooks'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

interface EditableVisualAsset extends QuestionVisualAsset {
  isDeleted?: boolean
}

function QuestionVisualEditor({
  initialVisualAssets,
  onSave,
  pending,
}: {
  initialVisualAssets: EditableVisualAsset[]
  onSave: (assets: EditableVisualAsset[]) => Promise<void>
  pending: boolean
}) {
  const [visualAssets, setVisualAssets] = useState<EditableVisualAsset[]>(() => initialVisualAssets)

  const visibleVisuals = visualAssets.filter((asset) => !asset.isDeleted)

  function moveVisual(index: number, direction: -1 | 1) {
    setVisualAssets((current) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const next = [...current]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Visual reference metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {visualAssets.length ? visualAssets.map((asset, index) => (
            <div className="rounded-2xl border border-slate-200 p-4" key={asset.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">Figure {index + 1}</p>
                  <p className="text-sm text-slate-500">{asset.originalName ?? 'Imported image'}</p>
                </div>
                <div className="flex gap-2">
                  <Button disabled={index === 0} onClick={() => moveVisual(index, -1)} type="button" variant="outline"><ArrowUp className="size-4" /></Button>
                  <Button disabled={index === visualAssets.length - 1} onClick={() => moveVisual(index, 1)} type="button" variant="outline"><ArrowDown className="size-4" /></Button>
                  <Button onClick={() => setVisualAssets((current) => current.map((item) => item.id === asset.id ? { ...item, isDeleted: !item.isDeleted } : item))} type="button" variant={asset.isDeleted ? 'secondary' : 'outline'}><Trash2 className="size-4" /></Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Alt text</p>
                  <Input value={asset.altText ?? ''} onChange={(event) => setVisualAssets((current) => current.map((item) => item.id === asset.id ? { ...item, altText: event.target.value } : item))} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Caption</p>
                  <Input value={asset.caption ?? ''} onChange={(event) => setVisualAssets((current) => current.map((item) => item.id === asset.id ? { ...item, caption: event.target.value } : item))} />
                </div>
              </div>
              {asset.isDeleted ? <p className="mt-3 text-sm text-red-600">This visual will be removed when you save.</p> : null}
            </div>
          )) : <p className="text-sm text-slate-500">No visual references are attached to this question.</p>}
          <div className="flex justify-end">
            <Button disabled={pending} onClick={() => void onSave(visualAssets)} type="button"><Save className="size-4" /> Save visuals</Button>
          </div>
        </CardContent>
      </Card>
      <QuestionVisualPanel title="Preview" visuals={visibleVisuals} />
    </div>
  )
}

export function AdminEditQuestionPage() {
  const { questionId = '' } = useParams()
  const { toast } = useToast()
  const questionQuery = useAdminQuestion(questionId)
  const updateQuestion = useUpdateAdminQuestion(questionId)
  const updateRubric = useUpdateQuestionRubric(questionId)
  const [tab, setTab] = useState<'question' | 'rubric' | 'visuals'>('question')

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

  async function handleSaveVisuals(visualAssets: EditableVisualAsset[]) {
    try {
      await updateQuestion.mutateAsync({
        visual_assets: visualAssets.map((asset, index) => ({
          id: asset.id,
          alt_text: asset.altText,
          caption: asset.caption,
          sort_order: index + 1,
          is_deleted: asset.isDeleted,
        })),
      })
      toast({ title: 'Visual references updated', description: 'Visual ordering and labels were saved.', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not save visual references', description: error instanceof Error ? error.message : 'Try again.', variant: 'error' })
    }
  }

  if (questionQuery.isLoading) return <Card><CardContent className="pt-6 text-sm text-slate-600">Loading question…</CardContent></Card>
  if (questionQuery.isError) return <Alert className="border-red-200 bg-red-50 text-red-900"><AlertTitle>Could not load question</AlertTitle><AlertDescription>{questionQuery.error.message}</AlertDescription></Alert>
  if (!question) return <Card><CardContent className="pt-6 text-sm text-slate-600">Question not found.</CardContent></Card>

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Edit question"
        title={`Question ${question.questionNumber}`}
        description="Question content, rubric guidance, and visual references are separated into focused editing sections so imported exam material stays accurate."
        actions={question.paper ? <RouterLink to={routes.admin.papers.byId(question.paper.id)}><Button variant="outline">Back to paper</Button></RouterLink> : null}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Paper</p><p className="mt-3 font-semibold">{question.paper?.title ?? '—'}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Marks</p><p className="mt-3 text-3xl font-semibold">{question.maxMarks}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Visuals</p><p className="mt-3 text-3xl font-semibold">{question.visualAssets.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p><div className="mt-3 flex flex-wrap gap-2"><Badge className={question.paper?.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>{question.paper?.isPublished ? 'Published paper' : 'Draft paper'}</Badge>{question.hasVisual ? <Badge className="bg-blue-50 text-blue-700">Visual question</Badge> : null}</div></CardContent></Card>
      </div>

      <Tabs onValueChange={(value) => setTab(value as 'question' | 'rubric' | 'visuals')} value={tab}>
        <TabsList>
          <TabsTrigger value="question">Question content</TabsTrigger>
          <TabsTrigger value="rubric">Rubric & reference</TabsTrigger>
          <TabsTrigger value="visuals">Visual references</TabsTrigger>
        </TabsList>
        <TabsContent value="question">
          <QuestionForm isSubmitting={updateQuestion.isPending} mode="edit" onSubmit={handleQuestionSubmit} paperTitle={question.paper?.title} question={question} submitLabel="Save question" />
        </TabsContent>
        <TabsContent value="rubric">
          <RubricForm isSubmitting={updateRubric.isPending} onSubmit={handleRubricSubmit} rubric={question.rubric} submitLabel="Save rubric" />
        </TabsContent>
        <TabsContent value="visuals">
          <QuestionVisualEditor initialVisualAssets={question.visualAssets.map((asset) => ({ ...asset }))} key={question.updatedAt ?? String(question.id)} onSave={handleSaveVisuals} pending={updateQuestion.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
