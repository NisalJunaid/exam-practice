import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { routes } from '@/lib/constants/routes'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)

    try {
      const user = await login({ ...values, device_name: 'frontend-web' })
      const destination = (location.state as { from?: string } | null)?.from
      navigate(destination ?? (user.role === 'admin' ? routes.admin.dashboard : routes.dashboard))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <GraduationCap className="size-4" />
          Structured exam practice for students and admins
        </div>
        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Academic exam workflows with a clean, review-first frontend shell.</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            This starter interface wires the authentication, student practice, and admin review surfaces so the application can grow into the full blueprint without reworking the core routing model.
          </p>
        </div>
      </section>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use a seeded student or admin account to access the corresponding workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField id="email" label="Email" error={form.formState.errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </FormField>
            <FormField id="password" label="Password" error={form.formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
            </FormField>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-sm text-slate-500">
              Need a student account?{' '}
              <Link className="font-medium text-blue-700" to={routes.register}>
                Register here
              </Link>
              .
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
