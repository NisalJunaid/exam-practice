import { apiFetch, setToken } from '@/lib/api'
import type { ApiEnvelope, User } from '@/types/api'

interface LoginPayload {
  email: string
  password: string
  device_name?: string
}

interface LoginResponse {
  token: string
  user: User
}

export async function login(payload: LoginPayload) {
  const response = await apiFetch<ApiEnvelope<LoginResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setToken(response.data.token)
  return response.data.user
}

export async function getCurrentUser() {
  const response = await apiFetch<ApiEnvelope<User>>('/auth/me')
  return response.data
}

export async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' })
  setToken(null)
}
