import { ImagePlus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DocumentImportItem } from '@/features/imports/types'

interface ImportVisualUploaderProps {
  item: DocumentImportItem
  isUploading?: boolean
  isDeleting?: boolean
  onUpload: (files: FileList | null) => void
  onDelete: (visualId: number) => void
}

export function ImportVisualUploader({ item, isUploading, isDeleting, onUpload, onDelete }: ImportVisualUploaderProps) {
  return (
    <Card className={item.requiresVisualReference ? 'border-amber-200 bg-amber-50/40' : undefined}>
      <CardHeader>
        <CardTitle className="text-base">Reference visuals</CardTitle>
        <CardDescription>
          {item.requiresVisualReference
            ? 'This question depends on a visual asset. Upload one or more reference images before final approval.'
            : 'Optional supporting visuals can still be attached for admin review.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
            <ImagePlus className="size-4" />
            {isUploading ? 'Uploading…' : 'Upload visuals'}
            <input
              className="hidden"
              multiple
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => onUpload(event.target.files)}
              disabled={isUploading}
            />
          </label>
          <span className="text-sm text-slate-500">{item.visualAssets.length} attached</span>
        </div>

        {item.visualAssets.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {item.visualAssets.map((visual) => (
              <div key={visual.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{visual.originalName}</p>
                  <p className="text-xs text-slate-500">{visual.assetRole} · {visual.mimeType ?? 'unknown type'}</p>
                </div>
                <Button type="button" size="icon" variant="ghost" disabled={isDeleting} onClick={() => onDelete(visual.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No visuals attached yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
