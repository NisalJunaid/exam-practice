import { ArrowRight, LibraryBig, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { routes } from '@/lib/constants/routes'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'student'}`}
        description="The dashboard establishes the exam-first information architecture: discover papers, continue attempts, and review marked submissions from one stable shell."
        actions={
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" to={routes.papers.index}>
            Browse papers
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Route family" value="7" helper="Dashboard, catalog, detail, take, marking, results, and review are all mounted." />
        <StatCard label="Forms wired" value="RHF + Zod" helper="Auth and admin forms are validated and ready for deeper business logic." />
        <StatCard label="Providers" value="3" helper="Router, query, and auth providers compose the application root." />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student journey</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <p>1. Browse the paper catalog with typed filter parameters.</p>
            <p>2. Open a paper detail page to inspect instructions and question structure.</p>
            <p>3. Start or resume an attempt, then move through marking, results, and review routes.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need the admin tools?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3 text-sm text-slate-600">
            <p>Admin-only routes are guarded separately and mounted under the dedicated admin shell.</p>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-blue-700" to={routes.papers.index}>
              <LibraryBig className="size-4" />
              Explore paper catalog
            </Link>
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
              <ShieldCheck className="size-4" />
              Admin access requires an authenticated admin account.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
