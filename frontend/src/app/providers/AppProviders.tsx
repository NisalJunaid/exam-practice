import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { AppRouter } from '@/app/router'
import { AuthProvider } from '@/app/providers/AuthProvider'

export function AppProviders() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  )
}
