import { AlertTriangle, CheckCircle2, ImageOff, SearchCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import type { ImportReviewStatus } from '../types'
import { formatReviewStatus } from '../utils'

const styles: Record<ImportReviewStatus, { className: string; Icon: typeof CheckCircle2 }> = {
  ready: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Icon: CheckCircle2,
  },
  needs_review: {
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    Icon: SearchCheck,
  },
  missing_visual: {
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    Icon: ImageOff,
  },
  warning: {
    className: 'border-red-200 bg-red-50 text-red-700',
    Icon: AlertTriangle,
  },
}

export function ImportMatchStatusBadge({ status }: { status: ImportReviewStatus }) {
  const { className, Icon } = styles[status]

  return (
    <Badge className={className} variant="outline">
      <Icon className="mr-1 size-3.5" />
      {formatReviewStatus(status)}
    </Badge>
  )
}
