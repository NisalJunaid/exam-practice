import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { routes } from '@/lib/constants/routes'

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
    <div className="flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create student account</CardTitle>
          <CardDescription>Registration uses React Hook Form + Zod so the production business flow can plug in without changing the shell.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="md:col-span-2">
              <FormField id="name" label="Full name" error={form.formState.errors.name?.message}>
                <Input id="name" {...form.register('name')} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField id="email" label="Email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" {...form.register('email')} />
              </FormField>
            </div>
            <FormField id="password" label="Password" error={form.formState.errors.password?.message}>
              <Input id="password" type="password" {...form.register('password')} />
            </FormField>
            <FormField id="password_confirmation" label="Confirm password" error={form.formState.errors.password_confirmation?.message}>
              <Input id="password_confirmation" type="password" {...form.register('password_confirmation')} />
            </FormField>
            {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
            <div className="flex items-center justify-between gap-3 md:col-span-2">
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
