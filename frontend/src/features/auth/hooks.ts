import { useEffect, useState } from 'react'
import { getCurrentUser } from './api'
import type { User } from '@/types/api'

export function useCurrentUserSnapshot() {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getCurrentUser()
      .then((user) => {
        if (!cancelled) setData(user)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
