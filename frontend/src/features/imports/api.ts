import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { DocumentImport, DocumentImportItem } from './types'

export const importsApi = {
  async list() {
    const { data } = await apiClient.get<ApiEnvelope<DocumentImport[]>>(endpoints.admin.imports)
    return data.data
  },
  async create(formData: FormData) {
    const { data } = await apiClient.post<ApiEnvelope<DocumentImport>>(endpoints.admin.imports, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },
  async detail(importId: string) {
    const { data } = await apiClient.get<ApiEnvelope<DocumentImport>>(endpoints.admin.import(importId))
    return data.data
  },
  async items(importId: string) {
    const { data } = await apiClient.get<ApiEnvelope<DocumentImportItem[]>>(endpoints.admin.importItems(importId))
    return data.data
  },
  async updateItem(itemId: string | number, payload: Partial<DocumentImportItem> & { questionKey: string; questionText: string; resolvedMaxMarks: number; matchStatus: DocumentImportItem['matchStatus'] }) {
    const { data } = await apiClient.put<ApiEnvelope<DocumentImportItem>>(endpoints.admin.importItem(itemId), {
      question_key: payload.questionKey,
      question_text: payload.questionText,
      reference_answer: payload.referenceAnswer,
      marking_guidelines: payload.markingGuidelines,
      resolved_max_marks: payload.resolvedMaxMarks,
      match_status: payload.matchStatus,
      admin_notes: payload.adminNotes,
      is_approved: payload.isApproved,
    })
    return data.data
  },
  async approve(importId: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ paperId: number; paperTitle: string; isPublished: boolean }>>(endpoints.admin.approveImport(importId))
    return data.data
  },
}
