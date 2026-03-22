import { AlertTriangle, CheckCircle2, FileWarning, GitMerge } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

import type { ImportMatchStatus } from '../types'
import { formatMatchStatus } from '../utils'

const statusConfig: Record<ImportMatchStatus, { className: string; Icon: typeof CheckCircle2 }> = {
  matched: {
    className: 'bg-emerald-50 text-emerald-700',
    Icon: CheckCircle2,
  },
  resolved: {
    className: 'bg-blue-50 text-blue-700',
    Icon: GitMerge,
  },
  ambiguous: {
    className: 'bg-amber-50 text-amber-800',
    Icon: AlertTriangle,
  },
  paper_only: {
    className: 'bg-orange-50 text-orange-700',
    Icon: FileWarning,
  },
  scheme_only: {
    className: 'bg-violet-50 text-violet-700',
    Icon: FileWarning,
  },
}

export function ImportMatchStatusBadge({ status, className }: { status: ImportMatchStatus; className?: string }) {
  const config = statusConfig[status]
  const Icon = config.Icon

  return (
    <Badge className={cn('gap-1.5 capitalize', config.className, className)}>
      <Icon className="size-3.5" />
      {formatMatchStatus(status)}
    </Badge>
  )
}
