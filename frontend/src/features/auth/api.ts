import { apiClient, clearAuthToken, setAuthToken } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import type { ApiEnvelope, User } from '@/lib/types/api'

import type { AuthCredentials, AuthResponse, RegisterPayload } from './types'

export const authApi = {
  async login(payload: AuthCredentials) {
    const { data } = await apiClient.post<ApiEnvelope<AuthResponse>>(endpoints.auth.login, payload)
    setAuthToken(data.data.token)
    return data.data
  },
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiEnvelope<AuthResponse>>(endpoints.auth.register, payload)
    setAuthToken(data.data.token)
    return data.data
  },
  async me() {
    const { data } = await apiClient.get<ApiEnvelope<User>>(endpoints.auth.me)
    return data.data
  },
  async logout() {
    await apiClient.post(endpoints.auth.logout)
    clearAuthToken()
  },
}
