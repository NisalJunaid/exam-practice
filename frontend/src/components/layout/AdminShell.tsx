import { FilePlus2, FileSearch, LayoutDashboard, ScrollText } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { AttachedSidebar } from '@/components/layout/AttachedSidebar'
import { routes } from '@/lib/constants/routes'

const links = [
  { to: routes.admin.dashboard, label: 'Overview', icon: LayoutDashboard },
  { to: routes.admin.papers.index, label: 'Papers', icon: ScrollText },
  { to: routes.admin.papers.create, label: 'Create paper', icon: FilePlus2 },
  { to: routes.admin.imports.create, label: 'Import review', icon: FileSearch },
]

export function AdminShell() {
  return (
    <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
      <AttachedSidebar links={links} storageKey="admin-sidebar" subtitle="Admin workspace" title="Manage" />
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
