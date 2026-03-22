import { apiFetch } from '@/lib/api'
import type { ApiEnvelope } from '@/types/api'
import type { DocumentImport, DocumentImportItem } from './types'

export async function fetchImports() {
  const response = await apiFetch<ApiEnvelope<DocumentImport[]>>('/admin/imports')
  return response.data
}

export async function createImport(formData: FormData) {
  const response = await apiFetch<ApiEnvelope<DocumentImport>>('/admin/imports', {
    method: 'POST',
    body: formData,
  })
  return response.data
}

export async function fetchImport(importId: string) {
  const response = await apiFetch<ApiEnvelope<DocumentImport>>(`/admin/imports/${importId}`)
  return response.data
}

export async function updateImportItem(itemId: number, payload: Partial<DocumentImportItem> & { questionKey: string; questionText: string; resolvedMaxMarks: number; matchStatus: DocumentImportItem['matchStatus'] }) {
  const response = await apiFetch<ApiEnvelope<DocumentImportItem>>(`/admin/import-items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({
      question_key: payload.questionKey,
      question_text: payload.questionText,
      reference_answer: payload.referenceAnswer,
      marking_guidelines: payload.markingGuidelines,
      resolved_max_marks: payload.resolvedMaxMarks,
      match_status: payload.matchStatus,
      admin_notes: payload.adminNotes,
      is_approved: payload.isApproved,
    }),
  })
  return response.data
}

export async function approveImport(importId: number) {
  return apiFetch<ApiEnvelope<{ paperId: number; paperTitle: string }>>(`/admin/imports/${importId}/approve`, {
    method: 'POST',
  })
}
