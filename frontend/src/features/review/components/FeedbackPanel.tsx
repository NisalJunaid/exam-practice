import { AlertCircle, CheckCircle2, Target } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FeedbackPanelProps {
  title: string
  items: string[]
  emptyLabel: string
  tone?: 'positive' | 'negative'
}

export function FeedbackPanel({ title, items, emptyLabel, tone = 'positive' }: FeedbackPanelProps) {
  const Icon = tone === 'positive' ? CheckCircle2 : AlertCircle
  const iconClassName = tone === 'positive' ? 'text-emerald-600' : 'text-rose-600'
  const panelClassName = tone === 'positive' ? 'bg-emerald-50/60' : 'bg-rose-50/60'

  return (
    <Card className={panelClassName}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={iconClassName + ' size-4'} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2 text-sm text-slate-700">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <Target className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
