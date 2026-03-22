import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface MarkBreakdownBadgeProps {
  awardedMarks: number | null | undefined
  maxMarks: number
  className?: string
}

export function MarkBreakdownBadge({ awardedMarks, maxMarks, className }: MarkBreakdownBadgeProps) {
  const safeAwardedMarks = awardedMarks ?? 0
  const ratio = maxMarks === 0 ? 0 : safeAwardedMarks / maxMarks

  const toneClassName = ratio >= 0.8
    ? 'bg-emerald-50 text-emerald-700'
    : ratio >= 0.4
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700'

  return (
    <Badge className={cn('px-3 py-1 text-sm font-semibold', toneClassName, className)}>
      {safeAwardedMarks}/{maxMarks} marks
    </Badge>
  )
}
