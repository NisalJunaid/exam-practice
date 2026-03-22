import { useAuth } from '@/app/providers/AuthProvider'

export function useAuthState() {
  return useAuth()
}
