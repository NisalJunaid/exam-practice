import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <Badge className="bg-blue-50 text-blue-700">{eyebrow}</Badge> : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
