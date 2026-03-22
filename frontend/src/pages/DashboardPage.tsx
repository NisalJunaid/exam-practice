import { ArrowRight, BookOpenText, FileSearch, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCatalogFilters } from '@/features/catalog/hooks'
import { usePaperList } from '@/features/papers/hooks'
import { routes } from '@/lib/constants/routes'

const quickSteps = [
  {
    title: 'Browse the catalog',
    description: 'Use board, level, subject, year, and session filters to narrow down published papers.',
  },
  {
    title: 'Inspect paper detail',
    description: 'Read instructions, scan the question outline, and verify marks and duration before starting.',
  },
  {
    title: 'Start an attempt',
    description: 'Use the primary CTA on the paper detail page to create an attempt and continue the student workflow.',
  },
]

export function DashboardPage() {
  const { user } = useAuth()
  const catalogQuery = useCatalogFilters()
  const papersQuery = usePaperList({})

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'student'}`}
        description="Your workspace centers the auth flow, the paper discovery experience, and the handoff into paper detail and attempt creation."
        actions={
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" to={routes.papers.index}>
            Browse papers
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Published papers"
          value={papersQuery.data?.length ?? (papersQuery.isLoading ? '…' : '0')}
          helper="Live count of the papers currently returned by the student listing endpoint."
        />
        <StatCard
          label="Available subjects"
          value={catalogQuery.data?.subjects.length ?? (catalogQuery.isLoading ? '…' : '0')}
          helper="Subjects come from the catalog filter resource so search choices stay backend-driven."
        />
        <StatCard
          label="Signed in as"
          value={user?.role === 'admin' ? 'Admin' : 'Student'}
          helper="The frontend auth flow hydrates the current user and protects routes by role."
        />
      </div>

      {catalogQuery.isError || papersQuery.isError ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Some dashboard data could not be loaded</AlertTitle>
          <AlertDescription>
            {catalogQuery.error?.message ?? papersQuery.error?.message ?? 'Try refreshing to load the latest catalog summary.'}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="size-5 text-blue-700" />
              Student journey
            </CardTitle>
            <CardDescription>Everything needed for paper discovery and attempt launch is now wired end to end.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {quickSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 shadow-sm">
                  {index + 1}
                </div>
                <h3 className="font-medium text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue-700" />
              Ready for practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-900">
              <p className="font-medium">Catalog filters now include board, level, subject, year, session, and free-text search.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Paper detail pages surface:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>paper metadata</li>
                <li>instructions</li>
                <li>question outline</li>
                <li>clear start attempt CTA</li>
              </ul>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-blue-700" to={routes.papers.index}>
              <FileSearch className="size-4" />
              Go to catalog
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
