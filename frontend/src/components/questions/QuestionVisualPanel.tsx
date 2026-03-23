import { ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

export interface QuestionVisualAsset {
  id: number
  assetRole: string | null
  originalName: string | null
  altText: string | null
  caption: string | null
  mimeType: string | null
  sortOrder: number
  url: string | null
}

interface QuestionVisualPanelProps {
  visuals: QuestionVisualAsset[]
  className?: string
  compact?: boolean
  title?: string
}

export function QuestionVisualPanel({ visuals, className, compact = false, title = 'Visual references' }: QuestionVisualPanelProps) {
  if (!visuals.length) return null

  return (
    <Card className={cn('border-slate-200 bg-slate-50/80', className)}>
      <CardHeader className={cn('gap-3', compact ? 'p-4' : 'p-5')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-slate-900/5 p-2 text-slate-700">
              <ImageIcon className="size-4" />
            </div>
            <CardTitle className="text-base text-slate-900">{title}</CardTitle>
          </div>
          <Badge className="bg-white text-slate-700">{visuals.length} {visuals.length === 1 ? 'item' : 'items'}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn('grid gap-4', compact ? 'p-4 pt-0' : 'p-5 pt-0')}>
        {visuals.map((visual, index) => (
          <figure className="grid gap-3" key={visual.id}>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <span>Figure {index + 1}</span>
              {visual.assetRole ? <span className="rounded-full bg-white px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-slate-600">{visual.assetRole.replace('_', ' ')}</span> : null}
            </div>
            <VisualImage index={index} visual={visual} />
            {visual.caption || visual.altText ? (
              <figcaption className="text-sm leading-6 text-slate-600">{visual.caption ?? visual.altText}</figcaption>
            ) : null}
          </figure>
        ))}
      </CardContent>
    </Card>
  )
}

function VisualImage({ visual, index }: { visual: QuestionVisualAsset; index: number }) {
  const [failed, setFailed] = useState(false)

  if (!visual.url || failed) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
        Preview unavailable for this visual reference.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <img
        alt={visual.altText ?? visual.originalName ?? `Visual reference ${index + 1}`}
        className="max-h-[28rem] w-full object-contain"
        onError={() => setFailed(true)}
        src={visual.url}
      />
    </div>
  )
}
