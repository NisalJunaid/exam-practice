import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope } from '@/lib/types/api'

import type { DocumentImport, DocumentImportItem, ImportItemVisualAsset } from './types'

export const importsApi = {
  async list() {
    const { data } = await apiClient.get<ApiEnvelope<DocumentImport[]>>(endpoints.admin.imports)
    return data.data
  },
  async create(formData: FormData) {
    const { data } = await apiClient.post<ApiEnvelope<DocumentImport>>(endpoints.admin.importsJson, formData, {
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
  async updateItem(itemId: string | number, payload: {
    questionKey: string
    questionNumber?: string | null
    parentKey?: string | null
    questionType: DocumentImportItem['questionType']
    stemContext?: string | null
    questionText: string
    referenceAnswer?: string | null
    markingGuidelines?: string | null
    sampleFullMarkAnswer?: string | null
    resolvedMaxMarks: number
    requiresVisualReference: boolean
    visualReferenceType: DocumentImportItem['visualReferenceType']
    visualReferenceNote?: string | null
    flags: DocumentImportItem['flags']
    questionPageNumber?: number | null
    markSchemePageNumber?: number | null
    adminNotes?: string | null
    isApproved: boolean
  }) {
    const { data } = await apiClient.put<ApiEnvelope<DocumentImportItem>>(endpoints.admin.importItem(itemId), {
      question_key: payload.questionKey,
      question_number: payload.questionNumber,
      parent_key: payload.parentKey,
      question_type: payload.questionType,
      stem_context: payload.stemContext,
      question_text: payload.questionText,
      reference_answer: payload.referenceAnswer,
      marking_guidelines: payload.markingGuidelines,
      sample_full_mark_answer: payload.sampleFullMarkAnswer,
      resolved_max_marks: payload.resolvedMaxMarks,
      requires_visual_reference: payload.requiresVisualReference,
      visual_reference_type: payload.visualReferenceType,
      visual_reference_note: payload.visualReferenceNote,
      flags: {
        needs_review: payload.flags.needsReview,
        has_visual: payload.flags.hasVisual,
        low_confidence_match: payload.flags.lowConfidenceMatch,
      },
      question_page_number: payload.questionPageNumber,
      mark_scheme_page_number: payload.markSchemePageNumber,
      admin_notes: payload.adminNotes,
      is_approved: payload.isApproved,
    })
    return data.data
  },
  async uploadVisuals(itemId: string | number, formData: FormData) {
    const { data } = await apiClient.post<{ data: ImportItemVisualAsset[]; item: DocumentImportItem }>(endpoints.admin.importItemVisuals(itemId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async deleteVisual(visualId: string | number) {
    const { data } = await apiClient.delete<{ message: string }>(endpoints.admin.importItemVisual(visualId))
    return data
  },
  async approve(importId: string, overrideMissingVisuals = false) {
    const { data } = await apiClient.post<ApiEnvelope<{ paperId: number; paperTitle: string; isPublished: boolean }>>(endpoints.admin.approveImport(importId), {
      override_missing_visuals: overrideMissingVisuals,
    })
    return data.data
  },
}
