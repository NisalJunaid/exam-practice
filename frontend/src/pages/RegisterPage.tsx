import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/common/FormField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { routes } from '@/lib/constants/routes'

const benefits = [
  'Create a dedicated student account.',
  'Browse published papers with typed filters.',
  'Open each paper detail page before starting an attempt.',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setError(null)

    try {
      await registerUser({ ...values, device_name: 'frontend-web' })
      navigate(routes.dashboard)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account.')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <Card className="border-slate-200 bg-slate-950 text-white">
        <CardHeader>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
            <UserPlus className="size-4" />
            Student registration
          </div>
          <CardTitle className="text-3xl">Create your account</CardTitle>
          <CardDescription className="text-slate-300">
            Registration immediately signs students in so they can continue straight into the dashboard and paper catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-200">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
              <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
              <span>{benefit}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create student account</CardTitle>
          <CardDescription>Use your email and password to set up access for the student browsing flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="md:col-span-2">
              <FormField id="name" label="Full name" error={form.formState.errors.name?.message}>
                <Input id="name" autoComplete="name" placeholder="Ada Lovelace" {...form.register('name')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField id="email" label="Email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" placeholder="student@example.com" {...form.register('email')} />
              </FormField>
            </div>
            <FormField id="password" label="Password" error={form.formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...form.register('password')} />
            </FormField>
            <FormField id="password_confirmation" label="Confirm password" error={form.formState.errors.password_confirmation?.message}>
              <Input id="password_confirmation" type="password" autoComplete="new-password" placeholder="Repeat your password" {...form.register('password_confirmation')} />
            </FormField>
            {error ? (
              <Alert className="border-red-200 bg-red-50 text-red-700 md:col-span-2">
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link className="font-medium text-blue-700" to={routes.login}>
                  Sign in
                </Link>
                .
              </p>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? 'Creating…' : 'Create account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
