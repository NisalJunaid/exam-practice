import { useQuery } from '@tanstack/react-query'

import { useAttemptDetail } from '@/features/attempts/hooks'
import { queryKeys } from '@/lib/constants/queryKeys'

import { reviewApi } from './api'

export function isAttemptMarkingInFlight(status: string | undefined) {
  return status === 'submitted' || status === 'marking'
}

export function useMarkingStatus(attemptId: string) {
  return useAttemptDetail(attemptId)
}

export function useAttemptResults(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.attempts.results(attemptId),
    queryFn: () => reviewApi.results(attemptId),
    enabled: Boolean(attemptId) && enabled,
    retry: false,
  })
}

export function useAttemptReview(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.attempts.review(attemptId),
    queryFn: () => reviewApi.review(attemptId),
    enabled: Boolean(attemptId) && enabled,
    retry: false,
  })
}
