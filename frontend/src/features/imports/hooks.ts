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
  })
}

export function useImportItems(importId: string) {
  return useQuery({
    queryKey: queryKeys.admin.importItems(importId),
    queryFn: () => importsApi.items(importId),
    enabled: Boolean(importId),
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.importItems(importId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.imports })
    },
  })
}

export function useUploadImportItemVisuals(importId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, formData }: { itemId: string | number; formData: FormData }) => importsApi.uploadVisuals(itemId, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.import(importId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.importItems(importId) })
    },
  })
}

export function useDeleteImportItemVisual(importId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visualId: string | number) => importsApi.deleteVisual(visualId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.import(importId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.importItems(importId) })
    },
  })
}

export function useApproveImport(importId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (overrideMissingVisuals?: boolean) => importsApi.approve(importId, overrideMissingVisuals),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.import(importId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.importItems(importId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.imports })
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.papers })
    },
  })
}
