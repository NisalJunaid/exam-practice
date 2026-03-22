import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Enter your full name.'),
  password_confirmation: z.string().min(8, 'Please confirm the password.'),
}).refine((values) => values.password === values.password_confirmation, {
  path: ['password_confirmation'],
  message: 'Passwords must match.',
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
