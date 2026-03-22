export type UserRole = 'admin' | 'student'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface ApiEnvelope<T> {
  data: T
}
