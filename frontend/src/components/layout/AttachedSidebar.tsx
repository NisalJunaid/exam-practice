import type { ComponentType } from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface SidebarLink {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  disabled?: boolean
}

interface AttachedSidebarProps {
  title: string
  subtitle: string
  storageKey: string
  links: SidebarLink[]
}

export function AttachedSidebar({ title, subtitle, storageKey, links }: AttachedSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    setCollapsed(stored === 'collapsed')
  }, [storageKey])

  useEffect(() => {
    window.localStorage.setItem(storageKey, collapsed ? 'collapsed' : 'expanded')
  }, [collapsed, storageKey])

  const nav = useMemo(
    () => (
      <nav className="grid gap-1.5">
        {links.map(({ to, label, icon: Icon, disabled }) => (
          <NavLink
            key={label}
            onClick={() => setMobileOpen(false)}
            to={disabled ? '#' : to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                disabled ? 'cursor-default text-slate-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                isActive && !disabled ? 'bg-slate-950 text-white hover:bg-slate-950 hover:text-white' : undefined,
                collapsed ? 'justify-center px-2' : undefined,
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn(collapsed ? 'hidden' : 'block')}>{label}</span>
          </NavLink>
        ))}
      </nav>
    ),
    [collapsed, links],
  )

  const sidebarBody = (
    <>
      <div className={cn('flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4', collapsed ? 'lg:justify-center' : undefined)}>
        <div className={cn(collapsed ? 'hidden lg:hidden' : 'block')}>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <Button className="hidden lg:inline-flex" onClick={() => setCollapsed((current) => !current)} size="sm" type="button" variant="ghost">
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
        <Button className="lg:hidden" onClick={() => setMobileOpen(false)} size="sm" type="button" variant="ghost">
          <X className="size-4" />
        </Button>
      </div>
      <div className="px-3 py-4">{nav}</div>
    </>
  )

  return (
    <>
      <div className="mb-4 lg:hidden">
        <Button onClick={() => setMobileOpen(true)} type="button" variant="outline">
          <Menu className="size-4" />
          Navigation
        </Button>
      </div>

      {mobileOpen ? <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <aside className={cn('hidden lg:sticky lg:top-24 lg:block lg:self-start', collapsed ? 'lg:w-20' : 'lg:w-72')}>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">{sidebarBody}</div>
      </aside>

      <aside className={cn('fixed inset-y-0 left-0 z-50 w-80 max-w-[88vw] bg-white shadow-2xl transition-transform duration-200 lg:hidden', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        {sidebarBody}
      </aside>
    </>
  )
}
