import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { importsApi } from '@/features/imports/api'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useImports() {
  return useQuery({
    queryKey: queryKeys.admin.imports,
    queryFn: importsApi.list,
  })
}

export function useImportDetail(importId: string) {
  return useQuery({
    queryKey: queryKeys.admin.import(importId),
    queryFn: () => importsApi.detail(importId),
    enabled: Boolean(importId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'processing' || status === 'uploaded' ? 5000 : false
    },
  })
}

export function useCreateImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.imports })
    },
  })
}

export function useUpdateImportItem(importId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, ...payload }: { itemId: string | number } & Parameters<typeof importsApi.updateItem>[1]) => importsApi.updateItem(itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.import(importId) })
    },
  })
}

export function useApproveImport(importId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => importsApi.approve(importId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.import(importId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.papers })
    },
  })
}
