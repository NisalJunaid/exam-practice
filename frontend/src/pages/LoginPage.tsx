import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, BookOpenCheck, GraduationCap, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/common/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { routes } from '@/lib/constants/routes'

const demoAccounts = [
  {
    label: 'Student flow',
    description: 'Sign in to browse papers, open a paper detail view, and start attempts.',
    icon: GraduationCap,
  },
  {
    label: 'Admin flow',
    description: 'Admin routes stay protected while student browsing remains focused and simple.',
    icon: ShieldCheck,
  },
]

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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          <BookOpenCheck className="size-4" />
          Frontend auth and paper browsing
        </div>
        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Sign in to explore exam papers, filters, and attempt-ready paper details.</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            The student flow is built around a clean auth experience, typed API integrations, and lightweight transitions into the paper catalog and detail screens.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {demoAccounts.map(({ label, description, icon: Icon }) => (
            <Card key={label} className="border-slate-200 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4 text-blue-700" />
                  {label}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your credentials to continue to your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField id="email" label="Email" error={form.formState.errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="student@example.com" {...form.register('email')} />
            </FormField>
            <FormField id="password" label="Password" error={form.formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" {...form.register('password')} />
            </FormField>
            {error ? (
              <Alert className="border-red-200 bg-red-50 text-red-700">
                <AlertTitle>Sign-in failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
              <ArrowRight className="size-4" />
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
