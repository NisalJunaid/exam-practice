import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminPapers } from '@/features/admin/hooks'
import { routes } from '@/lib/constants/routes'

export function AdminPaperListPage() {
  const papersQuery = useAdminPapers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')

  const filteredPapers = useMemo(() => {
    return (papersQuery.data ?? []).filter((paper) => {
      const haystack = [paper.title, paper.paperCode, paper.subject?.name, paper.subject?.code, paper.session, paper.year ? String(paper.year) : '']
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = haystack.includes(search.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' ? paper.isPublished : !paper.isPublished)

      return matchesSearch && matchesStatus
    })
  }, [papersQuery.data, search, statusFilter])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin papers"
        title="Paper inventory"
        description="Review draft versus published status, jump into editing, and keep repeated paper authoring work organized from a single list."
        actions={<Link to={routes.admin.papers.create}><Button>New paper</Button></Link>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Filter papers</CardTitle>
          <CardDescription>Use quick filters to narrow the inventory before editing or publishing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
          <Input onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, subject, paper code, year, or session" value={search} />
          <select
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200"
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'draft' | 'published')}
            value={statusFilter}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft only</option>
            <option value="published">Published only</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paper list</CardTitle>
          <CardDescription>Each row shows paper-level metadata only; question and rubric editing remain separate to preserve clarity.</CardDescription>
        </CardHeader>
        <CardContent>
          {papersQuery.isLoading ? (
            <p className="text-sm text-slate-600">Loading papers…</p>
          ) : filteredPapers.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paper</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPapers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{paper.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{paper.paperCode ?? 'No code'}{paper.year ? ` · ${paper.year}` : ''}{paper.session ? ` · ${paper.session}` : ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{paper.subject?.name ?? '—'}</p>
                          <p className="mt-1 text-xs text-slate-500">{[paper.subject?.examBoard?.name, paper.subject?.examLevel?.name].filter(Boolean).join(' • ') || 'No board/level yet'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={paper.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                          {paper.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>{paper.questionCount ?? paper.questions?.length ?? 0}</TableCell>
                      <TableCell>{paper.totalMarks}</TableCell>
                      <TableCell>{paper.updatedAt ? new Date(paper.updatedAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3">
                          <Link className="font-medium text-blue-700" to={routes.admin.papers.byId(paper.id)}>Edit paper</Link>
                          {paper.questions?.[0] ? <Link className="font-medium text-blue-700" to={routes.admin.questions.byId(paper.questions[0].id)}>Edit question</Link> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState description="Create a paper draft or clear the current filters to broaden the list." title="No papers match the current view" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
