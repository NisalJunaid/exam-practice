import type { AttemptAnswerDraft, AttemptQuestion, AttemptStructuredAnswer } from './types'

export function getQuestionDraftSignature(question: AttemptQuestion) {
  return JSON.stringify({
    id: question.id,
    updatedAt: question.updatedAt,
    answerInteractionType: question.answerInteractionType ?? null,
    interactionConfig: question.interactionConfig ?? {},
  })
}

export function createDraftFromQuestion(question: AttemptQuestion): AttemptAnswerDraft {
  return {
    studentAnswer: question.studentAnswer ?? '',
    structuredAnswer: question.structuredAnswer ?? null,
    clientSignature: getQuestionDraftSignature(question),
  }
}

export function isQuestionAnswered(question: AttemptQuestion, draft: AttemptAnswerDraft | undefined) {
  const current = draft ?? createDraftFromQuestion(question)
  if (current.studentAnswer.trim()) return true
  return hasStructuredValue(current.structuredAnswer)
}

export function summarizeConfig(config: Record<string, unknown> | null | undefined) {
  if (!config) return 'No config'
  const keys = Object.keys(config)
  if (!keys.length) return 'Default config'
  return keys.map((key) => `${key}`).join(', ')
}

export function sanitizeStructuredAnswerForApi(value: AttemptStructuredAnswer | null | undefined): AttemptStructuredAnswer | null {
  if (!value) return null
  const next = JSON.parse(JSON.stringify(value)) as AttemptStructuredAnswer
  stripClientKeys(next)
  return hasStructuredValue(next) ? next : null
}

function stripClientKeys(value: unknown): void {
  if (!value || typeof value !== 'object') return
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith('__client')) {
      delete (value as Record<string, unknown>)[key]
      continue
    }
    stripClientKeys((value as Record<string, unknown>)[key])
  }
}

export function hasStructuredValue(value: AttemptStructuredAnswer | null | undefined): boolean {
  if (!value) return false
  return containsMeaningfulValue(value)
}

function containsMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsMeaningfulValue)
  if (value && typeof value === 'object') return Object.values(value).some(containsMeaningfulValue)
  return String(value ?? '').trim().length > 0
}
