import { Search, SlidersHorizontal } from 'lucide-react'

import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { CatalogSearchParams, FilterFieldOption } from '@/features/catalog/types'

interface CatalogFiltersFormProps {
  filters: CatalogSearchParams
  boardOptions: FilterFieldOption[]
  levelOptions: FilterFieldOption[]
  subjectOptions: FilterFieldOption[]
  yearOptions: FilterFieldOption[]
  sessionOptions: FilterFieldOption[]
  isLoading?: boolean
  onChange: (key: keyof CatalogSearchParams, value: string) => void
  onReset: () => void
}

function FilterSelect({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  options: FilterFieldOption[]
  onChange: (value: string) => void
}) {
  return (
    <FormField id={id} label={label}>
      <select
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

export function CatalogFiltersForm({
  filters,
  boardOptions,
  levelOptions,
  subjectOptions,
  yearOptions,
  sessionOptions,
  isLoading,
  onChange,
  onReset,
}: CatalogFiltersFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-slate-500" />
            Filter papers
          </CardTitle>
          <p className="text-sm text-slate-500">Refine the catalog by board, level, subject, year, session, or a free-text search.</p>
        </div>
        <Button variant="outline" onClick={onReset} type="button">
          Reset filters
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FormField id="q" label="Search title or code">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              id="q"
              value={filters.q ?? ''}
              onChange={(event) => onChange('q', event.target.value)}
              placeholder="Biology Paper 1"
            />
          </div>
        </FormField>
        <FilterSelect id="exam_board_id" label="Exam board" value={filters.exam_board_id ?? ''} placeholder="All boards" options={boardOptions} onChange={(value) => onChange('exam_board_id', value)} />
        <FilterSelect id="exam_level_id" label="Level" value={filters.exam_level_id ?? ''} placeholder="All levels" options={levelOptions} onChange={(value) => onChange('exam_level_id', value)} />
        <FilterSelect id="subject_id" label="Subject" value={filters.subject_id ?? ''} placeholder="All subjects" options={subjectOptions} onChange={(value) => onChange('subject_id', value)} />
        <FilterSelect id="year" label="Year" value={filters.year ?? ''} placeholder="Any year" options={yearOptions} onChange={(value) => onChange('year', value)} />
        <FilterSelect id="session" label="Session" value={filters.session ?? ''} placeholder="Any session" options={sessionOptions} onChange={(value) => onChange('session', value)} />
        {isLoading ? <p className="text-sm text-slate-500 md:col-span-2 xl:col-span-3">Loading available filter values…</p> : null}
      </CardContent>
    </Card>
  )
}
