import type { AnswerInteractionType, AttemptAnswerDraft, AttemptQuestion, AttemptStructuredAnswer } from './types'

type InteractionResolutionSource = 'explicit' | 'fallback'

interface AttemptQuestionInteractionResolution {
  source: InteractionResolutionSource
  type: AnswerInteractionType
}

const warnedFallbacks = new Set<string>()

export function getQuestionDraftSignature(question: AttemptQuestion) {
  return JSON.stringify({
    id: question.id,
    updatedAt: question.updatedAt,
    answerInteractionType: resolveAttemptQuestionInteraction(question).type,
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

export function resolveAttemptQuestionInteraction(question: Pick<AttemptQuestion, 'id' | 'updatedAt' | 'questionKey' | 'questionNumber' | 'questionType' | 'answerInteractionType' | 'requiresVisualReference'>): AttemptQuestionInteractionResolution {
  if (question.answerInteractionType) {
    return { source: 'explicit', type: question.answerInteractionType }
  }

  const fallbackType = inferAnswerInteractionType(question.questionType, question.requiresVisualReference)
  warnInteractionFallback(question, fallbackType)

  return {
    source: 'fallback',
    type: fallbackType,
  }
}

function inferAnswerInteractionType(questionType: string, requiresVisualReference: boolean): AnswerInteractionType {
  switch (questionType) {
    case 'short_answer':
      return 'short_text'
    case 'structured':
    case 'essay':
      return 'long_text'
    case 'table':
      return 'table_input'
    case 'calculation':
      return 'calculation_with_working'
    case 'diagram_label':
      return requiresVisualReference ? 'diagram_annotation' : 'canvas_draw'
    case 'multiple_part':
      return 'multi_field'
    default:
      return 'long_text'
  }
}

function warnInteractionFallback(question: Pick<AttemptQuestion, 'id' | 'updatedAt' | 'questionKey' | 'questionNumber' | 'questionType'>, fallbackType: AnswerInteractionType) {
  if (!import.meta.env.DEV) return

  const warningKey = `${question.id}:${question.updatedAt ?? 'na'}:${fallbackType}`
  if (warnedFallbacks.has(warningKey)) return

  warnedFallbacks.add(warningKey)

  const label = question.questionKey?.trim() || question.questionNumber?.trim() || String(question.id)
  console.warn(
    `[attempt-renderer] Missing answer_interaction_type for question ${label}. Falling back from question_type=${question.questionType} to ${fallbackType}.`,
  )
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
