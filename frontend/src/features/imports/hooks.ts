import { useEffect, useState } from 'react'
import { approveImport, createImport, fetchImport, fetchImports, updateImportItem } from './api'
import type { DocumentImport, DocumentImportItem } from './types'

export function useImportsList() {
  const [data, setData] = useState<DocumentImport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setData(await fetchImports())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return {
    data,
    loading,
    error,
    async create(formData: FormData) {
      const nextImport = await createImport(formData)
      await load()
      return nextImport
    },
  }
}

export function useImportReview(importId: string) {
  const [data, setData] = useState<DocumentImport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setData(await fetchImport(importId))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [importId])

  return {
    data,
    loading,
    error,
    async updateItem(itemId: number, payload: Partial<DocumentImportItem> & { questionKey: string; questionText: string; resolvedMaxMarks: number; matchStatus: DocumentImportItem['matchStatus'] }) {
      await updateImportItem(itemId, payload)
      await load()
    },
    async approve() {
      const response = await approveImport(Number(importId))
      await load()
      return response
    },
  }
}
