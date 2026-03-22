import { Clock3, GraduationCap, Hash, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PaperListItem } from '@/features/papers/types'
import { routes } from '@/lib/constants/routes'

export function PaperCard({ paper }: { paper: PaperListItem }) {
  return (
    <Card className="h-full border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700">{paper.subject.examBoard}</Badge>
          <Badge>{paper.subject.examLevel}</Badge>
          {paper.subject.code ? <Badge className="bg-slate-900 text-white">{paper.subject.code}</Badge> : null}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">{paper.title}</CardTitle>
          <p className="text-sm text-slate-500">{paper.subject.name}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <Hash className="size-4 text-slate-400" />
            <span>{paper.paperCode ?? 'Code unavailable'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <Clock3 className="size-4 text-slate-400" />
            <span>{paper.durationMinutes ? `${paper.durationMinutes} mins` : 'Duration TBC'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <ScrollText className="size-4 text-slate-400" />
            <span>{paper.totalMarks} total marks</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <GraduationCap className="size-4 text-slate-400" />
            <span>{paper.session ?? 'Session TBC'}{paper.year ? ` ${paper.year}` : ''}</span>
          </div>
        </div>

        <Link className={buttonVariants({ variant: 'outline' })} to={routes.papers.byId(paper.id)}>
          View paper detail
        </Link>
      </CardContent>
    </Card>
  )
}
