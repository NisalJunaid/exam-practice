import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { FormField } from '@/components/common/FormField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import type { AdminQuestionRubric, AdminRubricFormValues } from './types'
import { rubricToFormValues, toRubricPayload } from './utils'

const schema = z.object({
  band_descriptor: z.string(),
  keywords_expected: z.string(),
  common_mistakes: z.string(),
  acceptable_alternatives: z.string(),
  marker_notes: z.string(),
})

interface RubricFormProps {
  rubric?: AdminQuestionRubric | null
  defaultValues?: AdminRubricFormValues
  isSubmitting?: boolean
  onSubmit?: (values: ReturnType<typeof toRubricPayload>) => Promise<void> | void
  submitLabel?: string
  showSubmitButton?: boolean
  onValuesChange?: (values: AdminRubricFormValues) => void
}

export function RubricForm({ rubric, defaultValues, isSubmitting, onSubmit, submitLabel, showSubmitButton = true, onValuesChange }: RubricFormProps) {
  const form = useForm<AdminRubricFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? rubricToFormValues(rubric),
  })

  useEffect(() => {
    form.reset(defaultValues ?? rubricToFormValues(rubric))
  }, [defaultValues, form, rubric])

  const watchedValues = useWatch({ control: form.control })

  useEffect(() => {
    if (!onValuesChange) return

    onValuesChange({
      band_descriptor: watchedValues.band_descriptor ?? '',
      keywords_expected: watchedValues.keywords_expected ?? '',
      common_mistakes: watchedValues.common_mistakes ?? '',
      acceptable_alternatives: watchedValues.acceptable_alternatives ?? '',
      marker_notes: watchedValues.marker_notes ?? '',
    })
  }, [onValuesChange, watchedValues])

  async function handleSubmit(values: AdminRubricFormValues) {
    if (!onSubmit) return
    await onSubmit(toRubricPayload(values))
  }

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Rubric fields</CardTitle>
            <CardDescription>Keep scoring language separate from question wording so rubrics can be tuned without accidentally altering student-facing content.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-amber-50 text-amber-700">Rubric editor</Badge>
              <Badge className="bg-slate-100 text-slate-700">Marker guidance only</Badge>
            </div>
            <FormField id="band_descriptor" label="Band descriptor">
              <Textarea id="band_descriptor" placeholder="High-level performance descriptor or marking band summary." {...form.register('band_descriptor')} />
            </FormField>
            <FormField hint="Add one item per line or separate with commas." id="keywords_expected" label="Keywords expected">
              <Textarea id="keywords_expected" placeholder="oxygen transport&#10;hemoglobin" {...form.register('keywords_expected')} />
            </FormField>
            <FormField hint="Add one item per line or separate with commas." id="common_mistakes" label="Common mistakes">
              <Textarea id="common_mistakes" placeholder="vague wording&#10;confuses diffusion with respiration" {...form.register('common_mistakes')} />
            </FormField>
            <FormField hint="Add one item per line or separate with commas." id="acceptable_alternatives" label="Acceptable alternatives">
              <Textarea id="acceptable_alternatives" placeholder="allow red cells for red blood cells" {...form.register('acceptable_alternatives')} />
            </FormField>
            <FormField id="marker_notes" label="Marker notes">
              <Textarea id="marker_notes" placeholder="Edge cases, follow-through rules, or moderation notes." {...form.register('marker_notes')} />
            </FormField>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Rubric guidance</CardTitle>
            <CardDescription>Separate these notes from the question body to reduce accidental content drift.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Keywords</p>
              <p>Use concise marking points the system should look for repeatedly across many responses.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">Mistakes</p>
              <p>Track common misconceptions so scoring and feedback stay consistent as similar questions are added.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSubmitButton ? (
        <div className="flex justify-end">
          <Button disabled={isSubmitting || form.formState.isSubmitting} type="submit">{isSubmitting ? 'Saving…' : submitLabel ?? 'Save rubric'}</Button>
        </div>
      ) : null}
    </form>
  )
}
