import { usePapersCatalog, useStartAttempt } from '@/features/papers/hooks'

export function StudentDashboardPage({ onOpenAttempt }: { onOpenAttempt: (attemptId: number) => void }) {
  const catalog = usePapersCatalog()
  const startAttempt = useStartAttempt()

  return (
    <div className="stack-lg">
      <section>
        <h1>Published papers</h1>
        <p className="subtle-text">Students only see mark-scheme details after they submit the whole paper.</p>
      </section>
      {catalog.loading ? <div className="panel">Loading papers…</div> : null}
      {catalog.error ? <div className="panel error-text">{catalog.error}</div> : null}
      {!catalog.loading && !catalog.error ? (
        <div className="card-grid">
          {catalog.data.map((paper) => (
            <article key={paper.id} className="panel">
              <div className="row-between">
                <div>
                  <p className="eyebrow">{paper.subject.examBoard} · {paper.subject.examLevel}</p>
                  <h2>{paper.title}</h2>
                  <p className="subtle-text">{paper.subject.name} {paper.subject.code ? `(${paper.subject.code})` : ''}</p>
                </div>
                <div className="pill">{paper.totalMarks} marks</div>
              </div>
              <div className="meta-grid">
                <span>Code: {paper.paperCode ?? '—'}</span>
                <span>Year: {paper.year ?? '—'}</span>
                <span>Duration: {paper.durationMinutes ?? '—'} min</span>
              </div>
              {startAttempt.error ? <p className="error-text">{startAttempt.error}</p> : null}
              <button
                className="button"
                onClick={async () => {
                  const attempt = await startAttempt.start(String(paper.id))
                  onOpenAttempt(attempt.id)
                }}
                disabled={startAttempt.loading}
              >
                {startAttempt.loading ? 'Starting…' : 'Start paper'}
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
