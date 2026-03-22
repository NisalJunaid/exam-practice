import { useState } from 'react'
import { z } from 'zod'
import { useImportsList } from '@/features/imports/hooks'

const uploadSchema = z.object({
  questionPaper: z.instanceof(File),
  markScheme: z.instanceof(File),
})

export function AdminImportPaperPage({ onOpenImport }: { onOpenImport: (importId: number) => void }) {
  const imports = useImportsList()
  const [questionPaper, setQuestionPaper] = useState<File | null>(null)
  const [markScheme, setMarkScheme] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="stack-lg">
      <section>
        <h1>Admin import workflow</h1>
        <p className="subtle-text">Upload both files, review the generated draft, edit ambiguous items, then approve to publish the paper.</p>
      </section>
      <section className="panel stack-md">
        <h2>Upload draft import</h2>
        <label className="field">
          <span>Question paper PDF</span>
          <input type="file" accept=".pdf,.txt" onChange={(event) => setQuestionPaper(event.target.files?.[0] ?? null)} />
        </label>
        <label className="field">
          <span>Mark scheme PDF</span>
          <input type="file" accept=".pdf,.txt" onChange={(event) => setMarkScheme(event.target.files?.[0] ?? null)} />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button
          className="button"
          disabled={creating}
          onClick={async () => {
            setError(null)
            setCreating(true)
            try {
              const validated = uploadSchema.parse({ questionPaper, markScheme })
              const formData = new FormData()
              formData.append('question_paper', validated.questionPaper)
              formData.append('mark_scheme', validated.markScheme)
              const created = await imports.create(formData)
              onOpenImport(created.id)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Unable to create import.')
            } finally {
              setCreating(false)
            }
          }}
        >
          {creating ? 'Processing import…' : 'Create draft import'}
        </button>
      </section>

      <section className="stack-md">
        <h2>Existing imports</h2>
        {imports.loading ? <div className="panel">Loading imports…</div> : null}
        {imports.error ? <div className="panel error-text">{imports.error}</div> : null}
        {imports.data.map((item) => (
          <article key={item.id} className="panel row-between wrap-gap">
            <div>
              <h3>{item.questionPaperName}</h3>
              <p className="subtle-text">Mark scheme: {item.markSchemeName}</p>
              <p className="info-text">Status: {item.status}</p>
            </div>
            <button className="button" onClick={() => onOpenImport(item.id)}>Review import</button>
          </article>
        ))}
      </section>
    </div>
  )
}
