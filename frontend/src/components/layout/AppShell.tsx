import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { routes } from '@/lib/constants/routes'

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3 text-slate-950" to={user?.role === 'admin' ? routes.admin.dashboard : routes.dashboard}>
            <div className="rounded-xl bg-slate-950 p-2 text-white">
              {user?.role === 'admin' ? <ShieldCheck className="size-5" /> : <GraduationCap className="size-5" />}
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Exam practice</div>
              <div className="text-base font-semibold">Academic assessment workspace</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Button variant="outline" onClick={() => void logout()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium" to={routes.login}>
                <BookOpen className="size-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
