import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  )
}
