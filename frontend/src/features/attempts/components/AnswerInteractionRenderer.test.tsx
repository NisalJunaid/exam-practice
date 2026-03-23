import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { AnswerInteractionRenderer } from './AnswerInteractionRenderer'
import type { AttemptQuestion } from '../types'

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: [] })),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      putImageData: vi.fn(),
      restore: vi.fn(),
      save: vi.fn(),
      stroke: vi.fn(),
    }),
  })

  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    configurable: true,
    value: (callback: (blob: Blob | null) => void) => callback(new Blob()),
  })
})

function buildQuestion(overrides: Partial<AttemptQuestion> = {}): AttemptQuestion {
  return {
    id: 42,
    answerId: null,
    questionNumber: '1',
    questionKey: '1(a)',
    questionText: 'Draw the apparatus.',
    questionType: 'diagram_label',
    answerInteractionType: 'canvas_draw',
    interactionConfig: {
      canvas: {
        width: 900,
        height: 500,
        background_mode: 'plain',
      },
    },
    stemContext: null,
    maxMarks: 4,
    requiresVisualReference: false,
    visualReferenceType: null,
    visualReferenceNote: null,
    hasVisual: false,
    visualAssets: [],
    studentAnswer: null,
    structuredAnswer: null,
    answerAssets: [],
    isBlank: true,
    submittedAt: null,
    updatedAt: '2026-03-23T00:00:00Z',
    ...overrides,
  }
}

describe('AnswerInteractionRenderer', () => {
  it('renders the canvas draw interaction when the backend explicitly sends canvas_draw', () => {
    const question = buildQuestion()

    const { container } = render(
      <AnswerInteractionRenderer
        draft={{ studentAnswer: '', structuredAnswer: null }}
        editable
        onChange={vi.fn()}
        onUploadAsset={vi.fn(async () => ({
          id: 1,
          attemptAnswerId: 1,
          assetType: 'drawing',
          disk: 'public',
          filePath: 'attempt-answers/drawing.png',
          originalName: 'drawing.png',
          mimeType: 'image/png',
          metadata: {},
          url: 'http://localhost/storage/attempt-answers/drawing.png',
          createdAt: null,
        }))}
        question={question}
      />,
    )

    expect(screen.getByText('Sketch canvas')).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeNull()
    expect(screen.queryByPlaceholderText('Enter your answer')).not.toBeInTheDocument()
  })
})
