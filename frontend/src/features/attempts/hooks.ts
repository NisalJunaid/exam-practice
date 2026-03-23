import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { attemptsApi } from '@/features/attempts/api'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useAttemptDetail(attemptId: string) {
  return useQuery({
    queryKey: queryKeys.attempts.detail(attemptId),
    queryFn: () => attemptsApi.detail(attemptId),
    enabled: Boolean(attemptId),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 10_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'submitted' || status === 'marking' ? 5000 : false
    },
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

export function useUploadAttemptAnswerAsset(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => attemptsApi.uploadAnswerAsset(attemptId, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attempts.detail(attemptId) })
    },
  })
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => attemptsApi.submit(attemptId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.attempts.detail(attempt.id), attempt)
      queryClient.setQueryData(queryKeys.attempts.results(attempt.id), attempt)
    },
  })
}
