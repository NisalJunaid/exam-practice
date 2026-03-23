import { useEffect, useRef, useState } from 'react'
import { Eraser, PenLine, Redo2, Trash2, Undo2, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import type { AttemptAnswerAsset, AttemptAnswerDraft, AttemptQuestion } from '../types'

interface Props {
  question: AttemptQuestion
  draft: AttemptAnswerDraft
  editable: boolean
  onChange: (draft: AttemptAnswerDraft) => void
  onUploadAsset: (questionId: number, assetType: string, file: File, metadata?: Record<string, unknown>) => Promise<AttemptAnswerAsset>
}

interface CanvasConfig {
  width?: number
  height?: number
  background_mode?: string
}

interface TextResponseConfig {
  label?: string
}

function getCanvasConfig(config: Record<string, unknown>): CanvasConfig {
  const value = config.canvas
  return value && typeof value === 'object' ? (value as CanvasConfig) : {}
}

function getTextResponseConfig(config: Record<string, unknown>): TextResponseConfig {
  const value = config.text_response
  return value && typeof value === 'object' ? (value as TextResponseConfig) : {}
}

export function AnswerInteractionRenderer({ question, draft, editable, onChange, onUploadAsset }: Props) {
  const type = question.answerInteractionType
  const config = question.interactionConfig ?? {}

  switch (type) {
    case 'short_text':
      return <TextAnswer editable={editable} multiline={false} value={draft.studentAnswer} onChange={(studentAnswer) => onChange({ ...draft, studentAnswer })} />
    case 'long_text':
    case 'other':
      return <TextAnswer editable={editable} multiline value={draft.studentAnswer} onChange={(studentAnswer) => onChange({ ...draft, studentAnswer })} />
    case 'select_single':
    case 'mcq_single':
      return <SelectSingleInput config={config} draft={draft} editable={editable} onChange={onChange} />
    case 'select_multiple':
    case 'mcq_multiple':
      return <SelectMultipleInput config={config} draft={draft} editable={editable} onChange={onChange} />
    case 'multi_field':
      return <MultiFieldInput config={config} draft={draft} editable={editable} onChange={onChange} />
    case 'table_input':
      return <TableInput config={config} draft={draft} editable={editable} onChange={onChange} />
    case 'calculation_with_working':
      return <CalculationInput config={config} draft={draft} editable={editable} onChange={onChange} />
    case 'canvas_draw':
    case 'graph_plot': {
      const canvasConfig = getCanvasConfig(config)
      return <CanvasAssetInput assetType={type === 'graph_plot' ? 'graph' : 'drawing'} backgroundMode={type === 'graph_plot' ? 'graph' : String(canvasConfig.background_mode ?? 'plain')} question={question} draft={draft} editable={editable} onChange={onChange} onUploadAsset={onUploadAsset} />
    }
    case 'diagram_annotation':
      return <CanvasAssetInput assetType="annotation" backgroundMode="plain" backgroundImage={question.visualAssets[0]?.url ?? null} question={question} draft={draft} editable={editable} onChange={onChange} onUploadAsset={onUploadAsset} />
    case 'canvas_plus_text':
      return <CanvasPlusTextInput question={question} config={config} draft={draft} editable={editable} onChange={onChange} onUploadAsset={onUploadAsset} />
    case 'image_upload':
      return <ImageUploadInput draft={draft} editable={editable} onChange={onChange} onUploadAsset={onUploadAsset} question={question} />
    case 'matching':
      return <MatchingInput config={config} draft={draft} editable={editable} onChange={onChange} />
    default:
      return <TextAnswer editable={editable} multiline value={draft.studentAnswer} onChange={(studentAnswer) => onChange({ ...draft, studentAnswer })} />
  }
}

function TextAnswer({ value, onChange, editable, multiline }: { value: string; onChange: (value: string) => void; editable: boolean; multiline: boolean }) {
  if (multiline) {
    return <Textarea className="min-h-[18rem] resize-y border-slate-200 bg-white text-base leading-7" disabled={!editable} onChange={(event) => onChange(event.target.value)} placeholder="Write your response here..." value={value} />
  }

  return <Input className="h-12 border-slate-200 bg-white text-base" disabled={!editable} onChange={(event) => onChange(event.target.value)} placeholder="Enter your answer" value={value} />
}

function SelectSingleInput({ config, draft, editable, onChange }: { config: Record<string, unknown>; draft: AttemptAnswerDraft; editable: boolean; onChange: (draft: AttemptAnswerDraft) => void }) {
  const options = ((config.options as string[] | undefined) ?? [])
  const selected = String(draft.structuredAnswer?.value ?? draft.studentAnswer ?? '')
  return (
    <div className="grid gap-3">
      {options.length <= 4 ? options.map((option) => (
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm" key={option}>
          <input checked={selected === option} disabled={!editable} name="single-select" onChange={() => onChange({ studentAnswer: option, structuredAnswer: { value: option } })} type="radio" />
          <span>{option}</span>
        </label>
      )) : (
        <select className="h-12 rounded-lg border border-slate-200 px-3 text-sm" disabled={!editable} onChange={(event) => onChange({ studentAnswer: event.target.value, structuredAnswer: { value: event.target.value } })} value={selected}>
          <option value="">Select an option</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      )}
    </div>
  )
}

function SelectMultipleInput({ config, draft, editable, onChange }: { config: Record<string, unknown>; draft: AttemptAnswerDraft; editable: boolean; onChange: (draft: AttemptAnswerDraft) => void }) {
  const options = ((config.options as string[] | undefined) ?? [])
  const values = new Set<string>((draft.structuredAnswer?.values as string[] | undefined) ?? [])
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm" key={option}>
          <input
            checked={values.has(option)}
            disabled={!editable}
            onChange={(event) => {
              const next = new Set(values)
              if (event.target.checked) next.add(option)
              else next.delete(option)
              const selected = [...next]
              onChange({ studentAnswer: selected.join(', '), structuredAnswer: { values: selected } })
            }}
            type="checkbox"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  )
}

function MultiFieldInput({ config, draft, editable, onChange }: { config: Record<string, unknown>; draft: AttemptAnswerDraft; editable: boolean; onChange: (draft: AttemptAnswerDraft) => void }) {
  const fields = ((config.fields as Array<{ key: string; label: string; type?: string }> | undefined) ?? [])
  const current = (draft.structuredAnswer?.fields as Record<string, string> | undefined) ?? {}
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div className="grid gap-2" key={field.key}>
          <Label>{field.label}</Label>
          <Input disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { fields: { ...current, [field.key]: event.target.value } } })} value={current[field.key] ?? ''} />
        </div>
      ))}
    </div>
  )
}

function TableInput({ config, draft, editable, onChange }: { config: Record<string, unknown>; draft: AttemptAnswerDraft; editable: boolean; onChange: (draft: AttemptAnswerDraft) => void }) {
  const columns = ((config.columns as Array<Record<string, unknown>> | undefined) ?? [])
  const rows = ((config.rows as Array<Record<string, unknown>> | undefined) ?? [])
  const current = (draft.structuredAnswer?.rows as Record<string, string> | undefined) ?? {}
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <Table>
        <TableHeader><TableRow>{columns.map((column) => <TableHead key={String(column.key)}>{String(column.label ?? column.key)}</TableHead>)}</TableRow></TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={String(row.key)}>
              {columns.map((column) => {
                const key = String(column.key)
                const readonly = Boolean(column.readonly)
                if (readonly) return <TableCell key={key}>{String(row[key] ?? '')}</TableCell>
                return (
                  <TableCell key={key}>
                    <Input disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { rows: { ...current, [String(row.key)]: event.target.value } } })} value={current[String(row.key)] ?? ''} />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CalculationInput({ config, draft, editable, onChange }: { config: Record<string, unknown>; draft: AttemptAnswerDraft; editable: boolean; onChange: (draft: AttemptAnswerDraft) => void }) {
  const current = draft.structuredAnswer ?? {}
  const finalLabel = String(config.final_answer_label ?? 'Final Answer')
  const workingLabel = String(config.working_label ?? 'Working')
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>{finalLabel}</Label>
        <Input disabled={!editable} onChange={(event) => onChange({ studentAnswer: event.target.value, structuredAnswer: { ...current, final_answer: event.target.value } })} value={String(current.final_answer ?? '')} />
      </div>
      <div className="grid gap-2">
        <Label>{workingLabel}</Label>
        <Textarea className="min-h-[14rem]" disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { ...current, working: event.target.value } })} value={String(current.working ?? '')} />
      </div>
    </div>
  )
}

function CanvasPlusTextInput({ config, draft, editable, onChange, onUploadAsset, question }: Props) {
  const canvasConfig = getCanvasConfig(question.interactionConfig)
  const textConfig = getTextResponseConfig(config)

  return (
    <div className="grid gap-4">
      <CanvasAssetInput assetType="drawing" backgroundMode={String(canvasConfig.background_mode ?? 'plain')} question={question} draft={draft} editable={editable} onChange={onChange} onUploadAsset={onUploadAsset} />
      <div className="grid gap-2">
        <Label>{String(textConfig.label ?? 'Explanation / notes')}</Label>
        <Textarea className="min-h-[8rem]" disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { ...(draft.structuredAnswer ?? {}), text: event.target.value } })} value={String(draft.structuredAnswer?.text ?? '')} />
      </div>
    </div>
  )
}

function ImageUploadInput({ question, draft, editable, onChange, onUploadAsset }: Props) {
  const currentAssetId = Number(draft.structuredAnswer?.upload_asset_id ?? 0)
  const currentAsset = question.answerAssets.find((asset) => asset.id === currentAssetId) ?? question.answerAssets[0]
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-dashed border-slate-300 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
          <Upload className="size-4" />
          Upload handwritten work / image answer
          <input className="hidden" disabled={!editable} type="file" accept="image/*" onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const asset = await onUploadAsset(question.id, 'upload', file)
            onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { ...(draft.structuredAnswer ?? {}), upload_asset_id: asset.id } })
          }} />
        </label>
      </div>
      {currentAsset?.url ? <img alt="Uploaded answer" className="max-h-80 rounded-2xl border border-slate-200 object-contain" src={currentAsset.url} /> : null}
      <Textarea className="min-h-[8rem]" disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { ...(draft.structuredAnswer ?? {}), notes: event.target.value } })} placeholder="Optional notes about the uploaded answer" value={String(draft.structuredAnswer?.notes ?? '')} />
    </div>
  )
}

function MatchingInput({ config, draft, editable, onChange }: { config: Record<string, unknown>; draft: AttemptAnswerDraft; editable: boolean; onChange: (draft: AttemptAnswerDraft) => void }) {
  const pairs = ((config.pairs as Array<{ left: string; rightOptions: string[]; key?: string }> | undefined) ?? [])
  const matches = (draft.structuredAnswer?.matches as Record<string, string> | undefined) ?? {}
  return (
    <div className="grid gap-3">
      {pairs.map((pair, index) => {
        const key = pair.key ?? String(index)
        return (
          <div className="grid gap-2 md:grid-cols-[1fr_220px] md:items-center" key={key}>
            <Label>{pair.left}</Label>
            <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { matches: { ...matches, [key]: event.target.value } } })} value={matches[key] ?? ''}>
              <option value="">Select</option>
              {(pair.rightOptions ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        )
      })}
    </div>
  )
}

function CanvasAssetInput({
  question,
  draft,
  editable,
  onChange,
  onUploadAsset,
  assetType,
  backgroundMode,
  backgroundImage,
}: Props & { assetType: string; backgroundMode: string; backgroundImage?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [history, setHistory] = useState<ImageData[]>([])
  const [future, setFuture] = useState<ImageData[]>([])
  const [uploading, setUploading] = useState(false)

  const canvasConfig = getCanvasConfig(question.interactionConfig)
  const width = Number(canvasConfig.width ?? 900)
  const height = Number(canvasConfig.height ?? 500)
  const currentAssetId = Number(draft.structuredAnswer?.drawing_asset_id ?? draft.structuredAnswer?.annotation_asset_id ?? 0)
  const currentAsset = question.answerAssets.find((asset) => asset.id === currentAssetId) ?? question.answerAssets[0]
  const storageKey = assetType === 'annotation' ? 'annotation_asset_id' : 'drawing_asset_id'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    drawBackground(context, width, height, backgroundMode)
  }, [backgroundMode, height, width])

  const pushHistory = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    setHistory((current) => [...current, context.getImageData(0, 0, canvas.width, canvas.height)].slice(-20))
    setFuture([])
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editable) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    pushHistory()
    const rect = canvas.getBoundingClientRect()
    context.beginPath()
    context.lineWidth = tool === 'eraser' ? 16 : 2
    context.lineCap = 'round'
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : '#0f172a'
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top)
    const move = (moveEvent: PointerEvent) => {
      context.lineTo(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top)
      context.stroke()
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const uploadSnapshot = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setUploading(true)
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      const file = new File([blob], `${assetType}-${question.id}.png`, { type: 'image/png' })
      const asset = await onUploadAsset(question.id, assetType, file, { width, height, backgroundMode })
      onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { ...(draft.structuredAnswer ?? {}), [storageKey]: asset.id } })
    } finally {
      setUploading(false)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    pushHistory()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    drawBackground(context, width, height, backgroundMode)
  }

  const applySnapshot = (snapshot: ImageData | undefined, setter: React.Dispatch<React.SetStateAction<ImageData[]>>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !snapshot) return
    setter((current) => current.slice(0, -1))
    context.putImageData(snapshot, 0, 0)
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-slate-100 text-slate-700">Sketch canvas</Badge>
        <Button disabled={!editable} onClick={() => setTool('pen')} size="sm" type="button" variant={tool === 'pen' ? 'default' : 'outline'}><PenLine className="size-4" /> Pen</Button>
        <Button disabled={!editable} onClick={() => setTool('eraser')} size="sm" type="button" variant={tool === 'eraser' ? 'default' : 'outline'}><Eraser className="size-4" /> Eraser</Button>
        <Button disabled={!history.length} onClick={() => {
          const canvas = canvasRef.current
          const context = canvas?.getContext('2d')
          if (!canvas || !context) return
          setFuture((current) => [...current, context.getImageData(0, 0, canvas.width, canvas.height)])
          applySnapshot(history[history.length - 1], setHistory)
        }} size="sm" type="button" variant="outline"><Undo2 className="size-4" /> Undo</Button>
        <Button disabled={!future.length} onClick={() => {
          const canvas = canvasRef.current
          const context = canvas?.getContext('2d')
          if (!canvas || !context) return
          setHistory((current) => [...current, context.getImageData(0, 0, canvas.width, canvas.height)])
          applySnapshot(future[future.length - 1], setFuture)
        }} size="sm" type="button" variant="outline"><Redo2 className="size-4" /> Redo</Button>
        <Button disabled={!editable} onClick={clearCanvas} size="sm" type="button" variant="outline"><Trash2 className="size-4" /> Clear</Button>
        <Button disabled={!editable || uploading} onClick={() => void uploadSnapshot()} size="sm" type="button"><Upload className="size-4" /> {uploading ? 'Saving…' : 'Save snapshot'}</Button>
      </div>
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
        <div className="relative inline-block">
          {backgroundImage ? <img alt="Reference" className="pointer-events-none absolute inset-0 h-full w-full object-contain" src={backgroundImage} /> : null}
          <canvas className="relative touch-none rounded-xl border border-slate-200" onPointerDown={startDrawing} ref={canvasRef} style={{ width: '100%', maxWidth: `${width}px`, aspectRatio: `${width} / ${height}` }} />
        </div>
      </div>
      {currentAsset?.url ? <img alt="Saved answer sketch" className="max-h-80 rounded-2xl border border-slate-200 object-contain" src={currentAsset.url} /> : <p className="text-sm text-slate-500">Save a canvas snapshot to attach it to your answer.</p>}
      {'text' in (draft.structuredAnswer ?? {}) ? null : <Textarea className="min-h-[6rem]" disabled={!editable} onChange={(event) => onChange({ studentAnswer: draft.studentAnswer, structuredAnswer: { ...(draft.structuredAnswer ?? {}), notes: event.target.value } })} placeholder="Optional notes for the saved sketch" value={String(draft.structuredAnswer?.notes ?? '')} />}
    </div>
  )
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number, mode: string) {
  if (mode !== 'graph') return
  context.save()
  context.strokeStyle = '#e2e8f0'
  context.lineWidth = 1
  for (let x = 0; x <= width; x += 25) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }
  for (let y = 0; y <= height; y += 25) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }
  context.strokeStyle = '#94a3b8'
  context.beginPath()
  context.moveTo(40, 0)
  context.lineTo(40, height)
  context.moveTo(0, height - 40)
  context.lineTo(width, height - 40)
  context.stroke()
  context.restore()
}
