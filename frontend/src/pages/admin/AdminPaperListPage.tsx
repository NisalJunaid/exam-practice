import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminPapers } from '@/features/admin/hooks'
import { routes } from '@/lib/constants/routes'

export function AdminPaperListPage() {
  const papersQuery = useAdminPapers()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin papers"
        title="Paper list"
        description="This list page anchors the draft/published paper inventory and links out to create and edit surfaces."
        actions={<Link className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" to={routes.admin.papers.create}>New paper</Link>}
      />

      {papersQuery.data?.length ? (
        <div className="grid gap-4">
          {papersQuery.data.map((paper) => (
            <Card key={paper.id}>
              <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{paper.title}</CardTitle>
                  <p className="text-sm text-slate-500">{paper.subject?.name ?? 'Subject pending'} · {paper.paperCode ?? 'No code'}</p>
                </div>
                <Badge className={paper.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                  {paper.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <p>{paper.questionCount ?? paper.questions?.length ?? 0} questions · {paper.totalMarks} marks</p>
                <div className="flex gap-3">
                  <Link className="font-medium text-blue-700" to={routes.admin.papers.byId(paper.id)}>Edit paper</Link>
                  {paper.questions?.[0] ? <Link className="font-medium text-blue-700" to={routes.admin.questions.byId(paper.questions[0].id)}>Edit first question</Link> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : papersQuery.isLoading ? (
        <Card><CardContent className="pt-6 text-sm text-slate-600">Loading papers…</CardContent></Card>
      ) : (
        <EmptyState title="No admin papers yet" description="Create a paper draft or approve an import to populate this route." />
      )}
    </div>
  )
}
