import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminPapers } from '@/features/admin/hooks'
import { useImports } from '@/features/imports/hooks'
import { routes } from '@/lib/constants/routes'

export function AdminDashboardPage() {
  const papersQuery = useAdminPapers()
  const importsQuery = useImports()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin workspace"
        title="Exam content operations"
        description="The admin shell groups content authoring, paper imports, and question maintenance into a route tree that scales as more workflows are added."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Papers" value={papersQuery.data?.length ?? '—'} helper="Published and draft papers from the admin endpoint." />
        <StatCard label="Imports" value={importsQuery.data?.length ?? '—'} helper="Import jobs ready for review or approval." />
        <StatCard label="Routes" value="6" helper="Dashboard, papers, create, edit, question edit, import upload, and import review." />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Next actions</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm text-slate-600">
            <Link className="font-medium text-blue-700" to={routes.admin.papers.create}>Create a paper draft →</Link>
            <Link className="font-medium text-blue-700" to={routes.admin.imports.create}>Upload an import bundle →</Link>
            <Link className="font-medium text-blue-700" to={routes.admin.papers.index}>Review paper list →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Why this structure</CardTitle></CardHeader>
          <CardContent className="text-sm leading-6 text-slate-600">
            The blueprint separates page shells from feature APIs and typed hooks. That makes future CRUD expansion straightforward without forcing a second routing rewrite later.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
