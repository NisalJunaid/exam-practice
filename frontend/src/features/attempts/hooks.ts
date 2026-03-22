import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { attemptsApi } from '@/features/attempts/api'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useAttemptDetail(attemptId: string) {
  return useQuery({
    queryKey: queryKeys.attempts.detail(attemptId),
    queryFn: () => attemptsApi.detail(attemptId),
    enabled: Boolean(attemptId),
    refetchInterval: (query) => (query.state.data?.status === 'marking' ? 5000 : false),
  })
}

export function useAttemptResult(attemptId: string) {
  return useQuery({
    queryKey: queryKeys.attempts.results(attemptId),
    queryFn: () => attemptsApi.results(attemptId),
    enabled: Boolean(attemptId),
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'marking' ? 4000 : false),
  })
}

export function useAttemptReview(attemptId: string) {
  return useQuery({
    queryKey: queryKeys.attempts.review(attemptId),
    queryFn: () => attemptsApi.review(attemptId),
    enabled: Boolean(attemptId),
    retry: false,
  })
}

export function useCreateAttempt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: attemptsApi.create,
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.attempts.detail(attempt.id), attempt)
    },
  })
}

export function useSaveAttemptAnswers(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof attemptsApi.saveAnswers>[1]) => attemptsApi.saveAnswers(attemptId, payload),
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.attempts.detail(attempt.id), attempt)
    },
  })
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => attemptsApi.submit(attemptId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.attempts.results(attempt.id), attempt)
      queryClient.setQueryData(queryKeys.attempts.detail(attempt.id), attempt)
    },
  })
}
