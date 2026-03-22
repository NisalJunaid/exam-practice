import { FilePlus2, FileSearch, ListChecks, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminPapers } from '@/features/admin/hooks'
import { useImports } from '@/features/imports/hooks'
import { routes } from '@/lib/constants/routes'

export function AdminDashboardPage() {
  const papersQuery = useAdminPapers()
  const importsQuery = useImports()

  const papers = papersQuery.data ?? []
  const imports = importsQuery.data ?? []
  const publishedCount = papers.filter((paper) => paper.isPublished).length
  const draftCount = papers.length - publishedCount
  const needsReviewImports = imports.filter((item) => item.status === 'needs_review').length
  const recentDrafts = papers.filter((paper) => !paper.isPublished).slice(0, 4)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin workflow"
        title="Paper, question, and rubric operations"
        description="Manage paper metadata, repeated question entry, and rubric refinement from one admin workspace with clear boundaries between each content layer."
        actions={
          <>
            <Link to={routes.admin.papers.create}><Button><FilePlus2 className="size-4" />New paper</Button></Link>
            <Link to={routes.admin.papers.index}><Button variant="outline"><ListChecks className="size-4" />Review papers</Button></Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard helper="Drafts still being authored or reviewed before publishing." label="Draft papers" value={draftCount} />
        <StatCard helper="Published papers that are already student-visible." label="Published papers" value={publishedCount} />
        <StatCard helper="Import jobs currently waiting for manual admin review." label="Imports to review" value={needsReviewImports} />
        <StatCard helper="The workflow separates paper fields, question fields, and rubric fields for accuracy." label="Admin lanes" value="3" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Repeatable authoring flow</CardTitle>
            <CardDescription>Use the same sequence each time to reduce data-entry mistakes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <Badge className="bg-blue-50 text-blue-700">1. Paper</Badge>
              <p className="mt-3 font-medium text-slate-900">Set metadata first</p>
              <p className="mt-1 text-sm text-slate-600">Subject, title, code, year, session, and instructions anchor everything that follows.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Badge className="bg-violet-50 text-violet-700">2. Question</Badge>
              <p className="mt-3 font-medium text-slate-900">Capture scoring units</p>
              <p className="mt-1 text-sm text-slate-600">Create or edit each answerable question with marks, order index, wording, and reference answer.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Badge className="bg-amber-50 text-amber-700">3. Rubric</Badge>
              <p className="mt-3 font-medium text-slate-900">Tune marker guidance</p>
              <p className="mt-1 text-sm text-slate-600">Adjust keywords, alternatives, mistakes, and band descriptors without touching student-facing copy.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
            <CardDescription>Jump directly into the highest-value admin tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Link className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50" to={routes.admin.papers.create}>
              <div className="flex items-center gap-3">
                <FilePlus2 className="size-4 text-blue-700" />
                <div>
                  <p className="font-medium text-slate-900">Create a draft paper</p>
                  <p className="text-slate-600">Start a new paper and move straight into question entry.</p>
                </div>
              </div>
            </Link>
            <Link className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50" to={routes.admin.imports.create}>
              <div className="flex items-center gap-3">
                <FileSearch className="size-4 text-blue-700" />
                <div>
                  <p className="font-medium text-slate-900">Review imports</p>
                  <p className="text-slate-600">Upload or approve imported paper bundles before they become live content.</p>
                </div>
              </div>
            </Link>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Publish only after review</p>
                  <p className="mt-1 text-sm">A paper cannot be published until it contains at least one question, which keeps student-visible content from going live prematurely.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent draft papers</CardTitle>
          <CardDescription>Pick up unfinished drafts quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDrafts.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {recentDrafts.map((paper) => (
                <Link className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50" key={paper.id} to={routes.admin.papers.byId(paper.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{paper.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{paper.subject?.name ?? 'Subject pending'} · {paper.questionCount ?? paper.questions?.length ?? 0} questions · {paper.totalMarks} marks</p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700">Draft</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState description="All current papers are published or no papers have been created yet." title="No recent drafts" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
