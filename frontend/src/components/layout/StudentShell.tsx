import { BarChart3, ClipboardPen, LayoutDashboard, LibraryBig } from 'lucide-react'
import { NavLink, Outlet, useMatch } from 'react-router-dom'

import { routes } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const links = [
  { to: routes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: routes.papers.index, label: 'Paper catalog', icon: LibraryBig },
  { to: routes.attempts.resultsById('latest'), label: 'Results space', icon: BarChart3, disabled: true },
  { to: routes.attempts.reviewById('latest'), label: 'Review space', icon: ClipboardPen, disabled: true },
]

export function StudentShell() {
  const isTakeAttemptRoute = useMatch(routes.attempts.take)

  if (isTakeAttemptRoute) {
    return (
      <section className="min-w-0">
        <Outlet />
      </section>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border bg-white p-3 shadow-sm">
        <nav className="grid gap-1">
          {links.map(({ to, label, icon: Icon, disabled }) => (
            <NavLink
              key={label}
              to={disabled ? '#' : to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  disabled ? 'cursor-default text-slate-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  isActive && !disabled ? 'bg-slate-950 text-white hover:bg-slate-950 hover:text-white' : undefined,
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
