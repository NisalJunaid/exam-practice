import { useState } from 'react'
import { useImportReview } from '@/features/imports/hooks'
import type { DocumentImportItem } from '@/features/imports/types'

export function AdminImportReviewPage({ importId, onBack }: { importId: string; onBack: () => void }) {
  const review = useImportReview(importId)
  const [activeItem, setActiveItem] = useState<DocumentImportItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)

  if (review.loading) return <div className="panel">Loading import review…</div>
  if (review.error) return <div className="panel error-text">{review.error}</div>
  if (!review.data) return <div className="panel">Import not found.</div>

  const unresolvedCount = (review.data.items ?? []).filter((item) => !item.isApproved || ['ambiguous', 'paper_only', 'scheme_only'].includes(item.matchStatus)).length

  return (
    <div className="stack-lg">
      <section className="row-between wrap-gap">
        <div>
          <h1>Review import #{review.data.id}</h1>
          <p className="subtle-text">Source files: {review.data.questionPaperName} / {review.data.markSchemeName}</p>
        </div>
        <div className="button-row">
          <button className="button button-secondary" onClick={onBack}>Back to imports</button>
          <button
            className="button"
            disabled={approving || review.data.status === 'approved' || unresolvedCount > 0}
            onClick={async () => {
              setError(null)
              setApproving(true)
              try {
                await review.approve()
              } catch (err) {
                setError((err as Error).message)
              } finally {
                setApproving(false)
              }
            }}
          >
            {review.data.status === 'approved' ? 'Import approved' : unresolvedCount > 0 ? `Resolve ${unresolvedCount} item(s)` : approving ? 'Approving…' : 'Approve import'}
          </button>
        </div>
      </section>

      <section className="panel stack-md">
        <h2>Import metadata</h2>
        <div className="meta-grid two-columns">
          {Object.entries(review.data.metadata ?? {}).map(([key, value]) => (
            <span key={key}><strong>{key}:</strong> {String(value ?? '—')}</span>
          ))}
        </div>
        <h3>Review counts</h3>
        <div className="meta-grid two-columns">
          {Object.entries(review.data.summary ?? {}).map(([key, value]) => (
            <span key={key}><strong>{key}:</strong> {value}</span>
          ))}
        </div>
      </section>

      <section className="panel stack-md">
        <h2>Import review table</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Question</th>
              <th>Marks</th>
              <th>Status</th>
              <th>Approved</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(review.data.items ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.questionKey}</td>
                <td>{item.questionText.slice(0, 120)}{item.questionText.length > 120 ? '…' : ''}</td>
                <td>QP {item.questionPaperMarks ?? '—'} / MS {item.markSchemeMarks ?? '—'} / Final {item.resolvedMaxMarks ?? '—'}</td>
                <td>{item.matchStatus}</td>
                <td>{item.isApproved ? 'Yes' : 'No'}</td>
                <td><button className="button button-secondary" onClick={() => setActiveItem(item)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {error ? <div className="panel error-text">{error}</div> : null}

      {activeItem ? (
        <ImportEditor
          item={activeItem}
          saving={saving}
          onClose={() => setActiveItem(null)}
          onSave={async (nextItem) => {
            setError(null)
            setSaving(true)
            try {
              await review.updateItem(activeItem.id, nextItem)
              setActiveItem(null)
            } catch (err) {
              setError((err as Error).message)
            } finally {
              setSaving(false)
            }
          }}
        />
      ) : null}
    </div>
  )
}

function ImportEditor({ item, onClose, onSave, saving }: { item: DocumentImportItem; onClose: () => void; onSave: (item: { questionKey: string; questionText: string; referenceAnswer: string; markingGuidelines: string; resolvedMaxMarks: number; matchStatus: DocumentImportItem['matchStatus']; adminNotes: string; isApproved: boolean }) => Promise<void>; saving: boolean }) {
  const [questionKey, setQuestionKey] = useState(item.questionKey)
  const [questionText, setQuestionText] = useState(item.questionText)
  const [referenceAnswer, setReferenceAnswer] = useState(item.referenceAnswer ?? '')
  const [markingGuidelines, setMarkingGuidelines] = useState(item.markingGuidelines ?? '')
  const [resolvedMaxMarks, setResolvedMaxMarks] = useState(String(item.resolvedMaxMarks ?? item.questionPaperMarks ?? item.markSchemeMarks ?? 1))
  const [matchStatus, setMatchStatus] = useState<DocumentImportItem['matchStatus']>(item.matchStatus)
  const [adminNotes, setAdminNotes] = useState(item.adminNotes ?? '')
  const [isApproved, setIsApproved] = useState(item.isApproved)

  return (
    <div className="modal-backdrop">
      <div className="modal-card stack-md">
        <div className="row-between wrap-gap">
          <h2>Edit import item</h2>
          <button className="button button-secondary" onClick={onClose}>Close</button>
        </div>
        <label className="field">
          <span>Question key</span>
          <input value={questionKey} onChange={(event) => setQuestionKey(event.target.value)} />
        </label>
        <label className="field">
          <span>Question text</span>
          <textarea value={questionText} onChange={(event) => setQuestionText(event.target.value)} />
        </label>
        <label className="field">
          <span>Reference answer</span>
          <textarea value={referenceAnswer} onChange={(event) => setReferenceAnswer(event.target.value)} />
        </label>
        <label className="field">
          <span>Marking guidelines</span>
          <textarea value={markingGuidelines} onChange={(event) => setMarkingGuidelines(event.target.value)} />
        </label>
        <div className="meta-grid two-columns">
          <label className="field">
            <span>Resolved max marks</span>
            <input type="number" value={resolvedMaxMarks} onChange={(event) => setResolvedMaxMarks(event.target.value)} />
          </label>
          <label className="field">
            <span>Match status</span>
            <select value={matchStatus} onChange={(event) => setMatchStatus(event.target.value as DocumentImportItem['matchStatus'])}>
              <option value="matched">matched</option>
              <option value="resolved">resolved</option>
              <option value="ambiguous">ambiguous</option>
              <option value="paper_only">paper_only</option>
              <option value="scheme_only">scheme_only</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Admin notes</span>
          <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} />
        </label>
        <label className="checkbox-field">
          <input type="checkbox" checked={isApproved} onChange={(event) => setIsApproved(event.target.checked)} />
          <span>Approved for final paper creation</span>
        </label>
        <div className="button-row">
          <button className="button button-secondary" onClick={onClose}>Cancel</button>
          <button
            className="button"
            disabled={saving}
            onClick={() => onSave({
              questionKey,
              questionText,
              referenceAnswer,
              markingGuidelines,
              resolvedMaxMarks: Number(resolvedMaxMarks),
              matchStatus,
              adminNotes,
              isApproved,
            })}
          >
            {saving ? 'Saving…' : 'Save item'}
          </button>
        </div>
      </div>
    </div>
  )
}
