import { FilePlus2, FileSearch, LayoutDashboard, ScrollText } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { routes } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const links = [
  { to: routes.admin.dashboard, label: 'Overview', icon: LayoutDashboard },
  { to: routes.admin.papers.index, label: 'Papers', icon: ScrollText },
  { to: routes.admin.papers.create, label: 'Create paper', icon: FilePlus2 },
  { to: routes.admin.imports.create, label: 'Import review', icon: FileSearch },
]

export function AdminShell() {
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border bg-white p-3 shadow-sm">
        <nav className="grid gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950',
                  isActive && 'bg-slate-950 text-white hover:bg-slate-950 hover:text-white',
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
