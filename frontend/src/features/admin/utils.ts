import type {
  AdminPaper,
  AdminPaperFormValues,
  AdminPaperPayload,
  AdminQuestion,
  AdminQuestionFormValues,
  AdminQuestionPayload,
  AdminQuestionRubric,
  AdminQuestionRubricPayload,
  AdminRubricFormValues,
  AdminSubjectOption,
} from './types'

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

export function paperToFormValues(paper?: AdminPaper | null): AdminPaperFormValues {
  return {
    subject_id: paper?.subject?.id ?? 0,
    title: paper?.title ?? '',
    slug: paper?.slug ?? '',
    paper_code: paper?.paperCode ?? '',
    year: paper?.year ? String(paper.year) : '',
    session: paper?.session ?? '',
    duration_minutes: paper?.durationMinutes ? String(paper.durationMinutes) : '',
    total_marks: paper?.totalMarks ? String(paper.totalMarks) : '',
    instructions: paper?.instructions ?? '',
  }
}

export function questionToFormValues(question?: AdminQuestion | null): AdminQuestionFormValues {
  return {
    question_number: question?.questionNumber ?? '',
    question_key: question?.questionKey ?? '',
    question_type: question?.questionType ?? 'short_answer',
    answer_interaction_type: question?.answerInteractionType ?? 'short_text',
    interaction_config: JSON.stringify(question?.interactionConfig ?? {}, null, 2),
    question_text: question?.questionText ?? '',
    reference_answer: question?.referenceAnswer ?? '',
    max_marks: question?.maxMarks ? String(question.maxMarks) : '',
    marking_guidelines: question?.markingGuidelines ?? '',
    sample_full_mark_answer: question?.sampleFullMarkAnswer ?? '',
    order_index: question?.orderIndex ? String(question.orderIndex) : '1',
    stem_context: question?.stemContext ?? '',
    requires_visual_reference: Boolean(question?.requiresVisualReference),
    visual_reference_type: question?.visualReferenceType ?? '',
    visual_reference_note: question?.visualReferenceNote ?? '',
  }
}

function joinList(values?: string[] | null) {
  return values?.join('\n') ?? ''
}

export function rubricToFormValues(rubric?: AdminQuestionRubric | null): AdminRubricFormValues {
  return {
    band_descriptor: rubric?.bandDescriptor ?? '',
    keywords_expected: joinList(rubric?.keywordsExpected),
    common_mistakes: joinList(rubric?.commonMistakes),
    acceptable_alternatives: joinList(rubric?.acceptableAlternatives),
    marker_notes: rubric?.markerNotes ?? '',
  }
}

function parseMultilineList(value: string) {
  return value
    .split(/\n|,/) 
    .map((item) => item.trim())
    .filter(Boolean)
}

export function toPaperPayload(values: AdminPaperFormValues): AdminPaperPayload {
  return {
    subject_id: values.subject_id,
    title: values.title.trim(),
    slug: emptyToNull(values.slug),
    paper_code: emptyToNull(values.paper_code),
    year: toOptionalNumber(values.year),
    session: emptyToNull(values.session),
    duration_minutes: toOptionalNumber(values.duration_minutes),
    total_marks: toOptionalNumber(values.total_marks),
    instructions: emptyToNull(values.instructions),
  }
}

export function toRubricPayload(values: AdminRubricFormValues): AdminQuestionRubricPayload {
  const keywords = parseMultilineList(values.keywords_expected)
  const mistakes = parseMultilineList(values.common_mistakes)
  const alternatives = parseMultilineList(values.acceptable_alternatives)

  return {
    band_descriptor: emptyToNull(values.band_descriptor),
    keywords_expected: keywords.length ? keywords : null,
    common_mistakes: mistakes.length ? mistakes : null,
    acceptable_alternatives: alternatives.length ? alternatives : null,
    marker_notes: emptyToNull(values.marker_notes),
  }
}

export function toQuestionPayload(values: AdminQuestionFormValues, rubricValues?: AdminRubricFormValues): AdminQuestionPayload {
  return {
    question_number: emptyToNull(values.question_number),
    question_key: emptyToNull(values.question_key),
    question_type: values.question_type,
    answer_interaction_type: values.answer_interaction_type,
    interaction_config: JSON.parse(values.interaction_config || '{}'),
    question_text: values.question_text.trim(),
    reference_answer: values.reference_answer.trim(),
    max_marks: Number(values.max_marks),
    marking_guidelines: emptyToNull(values.marking_guidelines),
    sample_full_mark_answer: emptyToNull(values.sample_full_mark_answer),
    order_index: Number(values.order_index),
    stem_context: emptyToNull(values.stem_context),
    requires_visual_reference: values.requires_visual_reference,
    visual_reference_type: values.requires_visual_reference ? emptyToNull(values.visual_reference_type) : null,
    visual_reference_note: values.requires_visual_reference ? emptyToNull(values.visual_reference_note) : null,
    ...(rubricValues ? { rubric: toRubricPayload(rubricValues) } : {}),
  }
}

export function buildSubjectOptions(papers: AdminPaper[] | undefined): AdminSubjectOption[] {
  const byId = new Map<number, AdminSubjectOption>()

  for (const paper of papers ?? []) {
    if (!paper.subject) continue
    if (byId.has(paper.subject.id)) continue

    byId.set(paper.subject.id, {
      id: paper.subject.id,
      label: paper.subject.code ? `${paper.subject.name} (${paper.subject.code})` : paper.subject.name,
      helper: [paper.subject.examBoard?.name, paper.subject.examLevel?.name].filter(Boolean).join(' • ') || 'Previously used subject',
    })
  }

  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export function getNextQuestionDefaults(paper?: AdminPaper | null) {
  const nextIndex = (paper?.questions?.length ?? 0) + 1
  const topLevelNumber = String(nextIndex)

  return {
    question_number: topLevelNumber,
    question_key: '',
    question_type: 'short_answer',
    answer_interaction_type: 'short_text',
    interaction_config: '{}',
    question_text: '',
    reference_answer: '',
    max_marks: '1',
    marking_guidelines: '',
    sample_full_mark_answer: '',
    order_index: String(nextIndex),
    stem_context: '',
    requires_visual_reference: false,
    visual_reference_type: '',
    visual_reference_note: '',
  } satisfies AdminQuestionFormValues
}
