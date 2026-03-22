import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SubmitAttemptDialogProps {
  open: boolean
  answeredCount: number
  totalQuestions: number
  pendingSave: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function SubmitAttemptDialog({ open, answeredCount, totalQuestions, pendingSave, onCancel, onConfirm }: SubmitAttemptDialogProps) {
  if (!open) return null

  const unansweredCount = Math.max(totalQuestions - answeredCount, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-slate-200 shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <CardTitle>Submit attempt for marking?</CardTitle>
              <p className="mt-1 text-sm text-slate-500">You will not be able to edit answers after submission.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-50 text-emerald-700">Answered: {answeredCount}</Badge>
            <Badge className="bg-amber-50 text-amber-700">Unanswered: {unansweredCount}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTitle>Final check</AlertTitle>
            <AlertDescription>
              Review your responses now. Submission queues AI marking and redirects you to the marking progress page.
            </AlertDescription>
          </Alert>

          {pendingSave ? (
            <Alert className="border-blue-200 bg-blue-50 text-blue-900">
              <AlertTitle>Saving latest edits</AlertTitle>
              <AlertDescription>Your most recent draft changes will be saved before submission continues.</AlertDescription>
            </Alert>
          ) : null}

          <Separator />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={onCancel} variant="outline">Continue editing</Button>
            <Button onClick={onConfirm}>Submit for marking</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
