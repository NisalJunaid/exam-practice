import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCatalogFilters } from '@/features/catalog/hooks'
import { usePaperList } from '@/features/papers/hooks'
import { routes } from '@/lib/constants/routes'

export function PaperCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => ({
    exam_board_id: searchParams.get('exam_board_id') ?? undefined,
    exam_level_id: searchParams.get('exam_level_id') ?? undefined,
    subject_id: searchParams.get('subject_id') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    session: searchParams.get('session') ?? undefined,
    q: searchParams.get('q') ?? undefined,
  }), [searchParams])
  const catalogQuery = useCatalogFilters()
  const papersQuery = usePaperList(filters)

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Paper catalog"
        title="Find published papers"
        description="Catalog filters and paper listing are backed by typed endpoint helpers so the student browse experience can evolve without route churn."
      />

      <Card>
        <CardHeader>
          <CardTitle>Search filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField id="search" label="Search title or code">
            <Input id="search" value={filters.q ?? ''} onChange={(event) => setFilter('q', event.target.value)} placeholder="Biology Paper 1" />
          </FormField>
          <FormField id="subject" label="Subject">
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" id="subject" value={filters.subject_id ?? ''} onChange={(event) => setFilter('subject_id', event.target.value)}>
              <option value="">All subjects</option>
              {catalogQuery.data?.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </FormField>
          <FormField id="year" label="Year">
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm" id="year" value={filters.year ?? ''} onChange={(event) => setFilter('year', event.target.value)}>
              <option value="">Any year</option>
              {catalogQuery.data?.years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </FormField>
        </CardContent>
      </Card>

      {papersQuery.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {papersQuery.data.map((paper) => (
            <Card key={paper.id}>
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{paper.subject.examBoard}</Badge>
                  <Badge className="bg-slate-100 text-slate-700">{paper.subject.examLevel}</Badge>
                </div>
                <div>
                  <CardTitle className="text-xl">{paper.title}</CardTitle>
                  <p className="text-sm text-slate-500">{paper.subject.name} · {paper.paperCode ?? 'Uncoded paper'}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <p><span className="font-medium text-slate-900">Marks:</span> {paper.totalMarks}</p>
                  <p><span className="font-medium text-slate-900">Duration:</span> {paper.durationMinutes ?? 'TBC'} mins</p>
                  <p><span className="font-medium text-slate-900">Session:</span> {paper.session ?? 'TBC'} {paper.year ?? ''}</p>
                </div>
                <Link className="text-sm font-medium text-blue-700" to={routes.papers.byId(paper.id)}>
                  Open paper detail →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : papersQuery.isLoading ? (
        <Card><CardContent className="pt-6 text-sm text-slate-600">Loading published papers…</CardContent></Card>
      ) : (
        <EmptyState title="No papers match these filters" description="The route and search state are wired. Once more papers exist, this page will scale without structural changes." />
      )}
    </div>
  )
}
