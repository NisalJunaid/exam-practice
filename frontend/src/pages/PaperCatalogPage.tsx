import { useMemo } from 'react'
import { BookX, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCatalogFilterOptions, useCatalogFilters } from '@/features/catalog/hooks'
import { CatalogFiltersForm } from '@/features/catalog/components/CatalogFiltersForm'
import { usePaperList } from '@/features/papers/hooks'
import { PaperCard } from '@/features/papers/components/PaperCard'
import { PaperCatalogSkeleton } from '@/features/papers/components/PaperCatalogSkeleton'

export function PaperCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => ({
    exam_board_id: searchParams.get('exam_board_id') ?? undefined,
    exam_level_id: searchParams.get('exam_level_id') ?? undefined,
    subject_id: searchParams.get('subject_id') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    session: searchParams.get('session') ?? undefined,
    q: searchParams.get('q') ?? undefined,
  }), [searchParams])
  const catalogQuery = useCatalogFilters()
  const papersQuery = usePaperList(filters)
  const options = useCatalogFilterOptions(catalogQuery.data)

  function setFilter(key: keyof typeof filters, value: string) {
    const next = new URLSearchParams(searchParams)

    if (value) next.set(key, value)
    else next.delete(key)

    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Paper catalog"
        title="Browse published exam papers"
        description="Filter by board, level, and subject, then drill into each paper for instructions, metadata, and a start-attempt entry point."
        actions={
          <Button variant="outline" onClick={() => { void catalogQuery.refetch(); void papersQuery.refetch() }}>
            <RefreshCw className="size-4" />
            Refresh data
          </Button>
        }
      />

      <CatalogFiltersForm
        filters={filters}
        boardOptions={options.boards}
        levelOptions={options.levels}
        subjectOptions={options.subjects}
        yearOptions={options.years}
        sessionOptions={options.sessions}
        isLoading={catalogQuery.isLoading}
        onChange={setFilter}
        onReset={resetFilters}
      />

      {catalogQuery.isError || papersQuery.isError ? (
        <Alert className="border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Unable to load the paper catalog</AlertTitle>
          <AlertDescription>
            {catalogQuery.error?.message ?? papersQuery.error?.message ?? 'Refresh the page and try again.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {papersQuery.isLoading ? (
        <PaperCatalogSkeleton />
      ) : papersQuery.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {papersQuery.data.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No papers match your filters"
          description="Try clearing one or more filters to broaden the search across boards, levels, subjects, and sessions."
          icon={<BookX className="size-5" />}
          action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
        />
      )}
    </div>
  )
}
