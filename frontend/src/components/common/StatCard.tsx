import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{helper}</p>
      </CardContent>
    </Card>
  )
}
