import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { routes } from '@/lib/constants/routes'

function GuardFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-2xl border bg-white px-8 py-6 text-sm text-slate-600 shadow-sm">Loading session…</div>
    </div>
  )
}

export function RequireGuest() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  if (isLoading) return <GuardFallback />
  if (isAuthenticated) {
    return <Navigate replace to={isAdmin ? routes.admin.dashboard : routes.dashboard} />
  }

  return <Outlet />
}

export function RequireAuth() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) return <GuardFallback />
  if (!isAuthenticated) {
    return <Navigate replace to={routes.login} state={{ from: location.pathname }} />
  }
  if (isAdmin) {
    return <Navigate replace to={routes.admin.dashboard} />
  }

  return <Outlet />
}

export function RequireAdmin() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) return <GuardFallback />
  if (!isAuthenticated) {
    return <Navigate replace to={routes.login} state={{ from: location.pathname }} />
  }
  if (!isAdmin) {
    return <Navigate replace to={routes.dashboard} />
  }

  return <Outlet />
}
