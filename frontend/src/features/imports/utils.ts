import type { DocumentImport, DocumentImportItem, ImportMatchStatus, ImportStatus } from './types'

export function formatImportStatus(status: ImportStatus) {
  return status.replace('_', ' ')
}

export function formatMatchStatus(status: ImportMatchStatus) {
  return status.replace('_', ' ')
}

export function getImportStatusTone(status: ImportStatus) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'needs_review':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'processing':
    case 'uploaded':
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200'
  }
}

export function getCounts(summary: DocumentImport['summary'] | undefined, items: DocumentImportItem[]) {
  const total = summary?.total_items ?? items.length
  const matched = summary?.matched ?? items.filter((item) => item.matchStatus === 'matched' || item.matchStatus === 'resolved').length
  const ambiguous = summary?.ambiguous ?? items.filter((item) => item.matchStatus === 'ambiguous').length
  const unmatched = summary?.unmatched ?? items.filter((item) => item.matchStatus === 'paper_only' || item.matchStatus === 'scheme_only').length

  return { total, matched, ambiguous, unmatched }
}

export function getSourcePages(item: DocumentImportItem) {
  const pages = [
    item.questionPageNumber ? `QP p.${item.questionPageNumber}` : null,
    item.markSchemePageNumber ? `MS p.${item.markSchemePageNumber}` : null,
    item.pageNumber ? `Detected p.${item.pageNumber}` : null,
  ].filter(Boolean)

  return pages.length ? pages.join(' • ') : '—'
}

export function getQuestionPreview(value: string | null | undefined, fallback = 'No extracted question text yet.') {
  const text = value?.trim()
  if (!text) return fallback
  return text.length > 160 ? `${text.slice(0, 157)}…` : text
}

export function stringifyMetadataValue(value: unknown) {
  if (value == null || value === '') return '—'
  if (Array.isArray(value)) {
    return value.join(', ') || '—'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
