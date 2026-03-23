import { ImageOff, Images } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface PreviewAsset {
  id: number
  assetType?: string | null
  url: string | null
  originalName?: string | null
  metadata?: Record<string, unknown>
}

interface AnswerAssetPreviewProps {
  asset: PreviewAsset
  className?: string
  title?: string
  emptyLabel?: string
}

export function AnswerAssetPreview({ asset, className, title, emptyLabel = 'Preview unavailable' }: AnswerAssetPreviewProps) {
  const [failed, setFailed] = useState(false)
  const width = typeof asset.metadata?.width === 'number' ? asset.metadata.width : null
  const height = typeof asset.metadata?.height === 'number' ? asset.metadata.height : null

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-slate-100 p-2 text-slate-700"><Images className="size-4" /></div>
          <div>
            <p className="text-sm font-medium text-slate-900">{title ?? 'Submitted image answer'}</p>
            <p className="text-xs text-slate-500">{asset.originalName ?? 'Generated preview'}</p>
          </div>
        </div>
        {asset.assetType ? <Badge className="bg-slate-100 text-slate-700">{asset.assetType.replaceAll('_', ' ')}</Badge> : null}
      </div>

      {asset.url && !failed ? (
        <img
          alt={asset.originalName ?? 'Submitted answer image'}
          className="max-h-[28rem] w-full object-contain bg-slate-50"
          onError={() => setFailed(true)}
          src={asset.url}
        />
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          <ImageOff className="size-6" />
          <p>{emptyLabel}</p>
        </div>
      )}

      {(width || height) ? (
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          Canvas export {width ?? '—'} × {height ?? '—'}
        </div>
      ) : null}
    </div>
  )
}
