import type { ReactNode } from 'react'
import type { User } from '@/types/api'

export function AppShell({ user, children, onNavigate, onLogout }: { user: User; children: ReactNode; onNavigate: (path: string) => void; onLogout: () => Promise<void> }) {
  const links = user.role === 'admin'
    ? [{ href: '/admin/imports', label: 'Import preview' }]
    : [{ href: '/student', label: 'Papers' }]

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <button className="link-button brand-button" onClick={() => onNavigate(user.role === 'admin' ? '/admin/imports' : '/student')}>Exam Prep Platform</button>
          <p className="subtle-text">Structured paper practice and admin review workflow.</p>
        </div>
        <div className="header-actions">
          <nav className="nav-links">
            {links.map((link) => (
              <button key={link.href} className="link-button" onClick={() => onNavigate(link.href)}>{link.label}</button>
            ))}
          </nav>
          <div className="user-badge">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <button className="button button-secondary" onClick={() => void onLogout()}>Log out</button>
        </div>
      </header>
      <main className="page-container">{children}</main>
    </div>
  )
}
