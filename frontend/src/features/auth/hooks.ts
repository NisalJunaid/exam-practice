import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/app/providers/AuthProvider'
import { authApi } from '@/features/auth/api'
import type { AuthCredentials, RegisterPayload } from '@/features/auth/types'
import { queryKeys } from '@/lib/constants/queryKeys'

export function useAuthState() {
  return useAuth()
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AuthCredentials) => authApi.login(payload),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(queryKeys.auth.me, user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(queryKeys.auth.me, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.auth.me, null)
      queryClient.removeQueries({ queryKey: queryKeys.all })
    },
  })
}
