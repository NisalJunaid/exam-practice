import { AlertTriangle, CheckCircle2, Clock3, FileQuestion, FileWarning } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface ImportSummaryCardProps {
  label: string
  value: number | string
  helper: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const toneStyles = {
  default: {
    card: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    Icon: Clock3,
  },
  success: {
    card: 'border-emerald-200 bg-emerald-50/40',
    badge: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle2,
  },
  warning: {
    card: 'border-amber-200 bg-amber-50/40',
    badge: 'bg-amber-100 text-amber-800',
    Icon: AlertTriangle,
  },
  danger: {
    card: 'border-red-200 bg-red-50/40',
    badge: 'bg-red-100 text-red-700',
    Icon: FileWarning,
  },
  info: {
    card: 'border-blue-200 bg-blue-50/40',
    badge: 'bg-blue-100 text-blue-700',
    Icon: FileQuestion,
  },
} as const

export function ImportSummaryCard({ label, value, helper, tone = 'default' }: ImportSummaryCardProps) {
  const { card, badge, Icon } = toneStyles[tone]

  return (
    <Card className={cn(card)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</CardDescription>
          <Badge className={badge}>
            <Icon className="size-3.5" />
          </Badge>
        </div>
        <CardTitle className="text-3xl text-slate-950">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{helper}</p>
      </CardContent>
    </Card>
  )
}
