import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { PaperForm } from '@/features/admin/PaperForm'
import { useCreateAdminPaper, useAdminSubjectOptions } from '@/features/admin/hooks'
import { routes } from '@/lib/constants/routes'
import { useToast } from '@/lib/toast/useToast'

export function AdminCreatePaperPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createPaper = useCreateAdminPaper()
  const subjectOptionsQuery = useAdminSubjectOptions()

  async function handleSubmit(payload: Parameters<typeof createPaper.mutateAsync>[0]) {
    try {
      const paper = await createPaper.mutateAsync(payload)
      toast({
        title: 'Paper draft created',
        description: `${paper.title} is ready for question entry.`,
        variant: 'success',
      })
      navigate(routes.admin.papers.byId(paper.id))
    } catch (error) {
      toast({
        title: 'Could not create paper',
        description: error instanceof Error ? error.message : 'Try again after reviewing the form.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Create paper"
        title="New paper draft"
        description="Start with paper-level metadata, then add question and rubric details in their own dedicated editing steps."
      />

      <Card>
        <CardContent className="pt-6">
          <PaperForm
            isSubmitting={createPaper.isPending}
            mode="create"
            onSubmit={handleSubmit}
            subjectOptions={subjectOptionsQuery.data}
          />
        </CardContent>
      </Card>
    </div>
  )
}
