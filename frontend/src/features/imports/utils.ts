import type { DocumentImport, DocumentImportItem, ImportReviewStatus, ImportStatus, QuestionType } from './types'

export function formatImportStatus(status: ImportStatus) {
  return status.replaceAll('_', ' ')
}

export function formatReviewStatus(status: ImportReviewStatus) {
  return status.replaceAll('_', ' ')
}

export function formatQuestionType(value: QuestionType | string | null | undefined) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ')
}

export function getImportStatusTone(status: ImportStatus) {
  switch (status) {
    case 'approved':
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
  return {
    total: summary?.totalItems ?? items.length,
    ready: summary?.readyItems ?? items.filter((item) => item.reviewStatus === 'ready').length,
    warnings: summary?.warningItems ?? items.filter((item) => item.reviewStatus === 'warning' || item.reviewStatus === 'needs_review').length,
    visualDependent: summary?.visualDependentItems ?? items.filter((item) => item.requiresVisualReference).length,
    missingVisuals: summary?.missingRequiredVisuals ?? items.filter((item) => item.requiresVisualReference && item.visualAssets.length === 0).length,
  }
}

export function getSourcePages(item: DocumentImportItem) {
  const pages = [
    item.questionPageNumber ? `Question p.${item.questionPageNumber}` : null,
    item.markSchemePageNumber ? `Mark scheme p.${item.markSchemePageNumber}` : null,
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
