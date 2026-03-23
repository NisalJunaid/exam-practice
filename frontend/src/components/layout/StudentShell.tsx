import { BarChart3, ClipboardPen, LayoutDashboard, LibraryBig } from 'lucide-react'
import { Outlet, useMatch } from 'react-router-dom'

import { AttachedSidebar } from '@/components/layout/AttachedSidebar'
import { routes } from '@/lib/constants/routes'

const links = [
  { to: routes.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: routes.papers.index, label: 'Paper catalog', icon: LibraryBig },
  { to: routes.attempts.resultsById('latest'), label: 'Results space', icon: BarChart3, disabled: true },
  { to: routes.attempts.reviewById('latest'), label: 'Review space', icon: ClipboardPen, disabled: true },
]

export function StudentShell() {
  const isTakeAttemptRoute = useMatch(routes.attempts.take)

  if (isTakeAttemptRoute) {
    return <section className="min-w-0"> <Outlet /> </section>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
      <AttachedSidebar links={links} storageKey="student-sidebar" subtitle="Student workspace" title="Navigate" />
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
