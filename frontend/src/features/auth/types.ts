import type { User } from '@/lib/types/api'

export interface AuthCredentials {
  email: string
  password: string
  device_name?: string
}

export interface RegisterPayload extends AuthCredentials {
  name: string
  password_confirmation: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (credentials: AuthCredentials) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
  refresh: () => Promise<unknown>
}
