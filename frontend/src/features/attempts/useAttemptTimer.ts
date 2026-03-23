import { useEffect, useMemo, useState } from 'react'

interface AttemptTimerInput {
  initialRemainingSeconds: number | null
  isActive: boolean
}

export function useAttemptTimer({ initialRemainingSeconds, isActive }: AttemptTimerInput, onExpire?: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(initialRemainingSeconds)

  useEffect(() => {
    if (!isActive || remainingSeconds === null) return

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => (current === null ? null : Math.max(0, current - 1)))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isActive, remainingSeconds === null])

  useEffect(() => {
    if (remainingSeconds === 0) {
      onExpire?.()
    }
  }, [onExpire, remainingSeconds])

  return useMemo(() => {
    if (remainingSeconds === null) {
      return { remainingSeconds, label: 'Untimed', tone: 'normal' as const }
    }

    const hours = Math.floor(remainingSeconds / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds % 60
    const label = hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${minutes}:${String(seconds).padStart(2, '0')}`
    const tone = remainingSeconds <= 60 ? 'urgent' : remainingSeconds <= 600 ? 'warning' : 'normal'

    return { remainingSeconds, label, tone }
  }, [remainingSeconds])
}
