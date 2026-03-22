import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo } from 'react'

import { authApi } from '@/features/auth/api'
import type { AuthContextValue, AuthCredentials, RegisterPayload } from '@/features/auth/types'
import { queryKeys } from '@/lib/constants/queryKeys'
import { clearAuthToken, getAuthToken } from '@/lib/api/client'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const hasToken = Boolean(getAuthToken())

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
  })

  const value = useMemo<AuthContextValue>(() => ({
    user: meQuery.data ?? null,
    isAuthenticated: Boolean(meQuery.data),
    isAdmin: meQuery.data?.role === 'admin',
    isLoading: hasToken && meQuery.isLoading,
    async login(credentials: AuthCredentials) {
      const payload = await authApi.login(credentials)
      queryClient.setQueryData(queryKeys.auth.me, payload.user)
      return payload.user
    },
    async register(payload: RegisterPayload) {
      const response = await authApi.register(payload)
      queryClient.setQueryData(queryKeys.auth.me, response.user)
      return response.user
    },
    async logout() {
      try {
        await authApi.logout()
      } finally {
        clearAuthToken()
        queryClient.setQueryData(queryKeys.auth.me, null)
        queryClient.removeQueries({ queryKey: queryKeys.all })
      }
    },
    refresh() {
      return queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  }), [hasToken, meQuery.data, meQuery.isLoading, queryClient])

  if (meQuery.isError) {
    clearAuthToken()
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
