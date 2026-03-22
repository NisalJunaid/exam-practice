import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { adminApi } from '@/features/admin/api'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useAdminPapers() {
  return useQuery({
    queryKey: queryKeys.admin.papers,
    queryFn: adminApi.papers,
  })
}

export function useAdminPaper(paperId: string) {
  return useQuery({
    queryKey: queryKeys.admin.paper(paperId),
    queryFn: () => adminApi.paper(paperId),
    enabled: Boolean(paperId),
  })
}

export function useAdminQuestion(questionId: string) {
  return useQuery({
    queryKey: queryKeys.admin.question(questionId),
    queryFn: () => adminApi.question(questionId),
    enabled: Boolean(questionId),
  })
}

export function useCreateAdminPaper() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.createPaper,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.papers })
    },
  })
}

export function useUpdateAdminPaper(paperId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.updatePaper>[1]) => adminApi.updatePaper(paperId, payload),
    onSuccess: (paper) => {
      queryClient.setQueryData(queryKeys.admin.paper(paper.id), paper)
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.papers })
    },
  })
}

export function usePublishPaper(paperId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => adminApi.publishPaper(paperId),
    onSuccess: (paper) => {
      queryClient.setQueryData(queryKeys.admin.paper(paper.id), paper)
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.papers })
    },
  })
}

export function useUpdateAdminQuestion(questionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.updateQuestion>[1]) => adminApi.updateQuestion(questionId, payload),
    onSuccess: (question) => {
      queryClient.setQueryData(queryKeys.admin.question(question.id), question)
    },
  })
}
