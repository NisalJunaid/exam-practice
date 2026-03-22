import { useEffect, useMemo, useState } from 'react'
import { LoginPage } from '@/pages/LoginPage'
import { AppShell } from '@/components/layout/AppShell'
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage'
import { PaperAttemptPage } from '@/pages/student/PaperAttemptPage'
import { AdminImportPaperPage } from '@/pages/admin/AdminImportPaperPage'
import { AdminImportReviewPage } from '@/pages/admin/AdminImportReviewPage'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '@/features/auth/api'
import type { User } from '@/types/api'

function getRoute() {
  return window.location.hash.replace(/^#/, '') || '/'
}

function navigate(path: string) {
  window.location.hash = path
}

export function App() {
  const [route, setRoute] = useState(getRoute())
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const currentUser = await getCurrentUser()
        if (!cancelled) {
          setUser(currentUser)
          if (route === '/') {
            navigate(currentUser.role === 'admin' ? '/admin/imports' : '/student')
          }
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoadingUser(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const routeParts = useMemo(() => route.split('/').filter(Boolean), [route])

  if (loadingUser) {
    return <div className="screen-center"><div className="panel"><p>Loading app…</p></div></div>
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={async (payload) => {
          const nextUser = await loginRequest(payload)
          setUser(nextUser)
          navigate(nextUser.role === 'admin' ? '/admin/imports' : '/student')
        }}
      />
    )
  }

  let content = <div className="panel">Unknown route.</div>

  if (user.role === 'student') {
    if (route === '/student') {
      content = <StudentDashboardPage onOpenAttempt={(attemptId) => navigate(`/student/attempts/${attemptId}`)} />
    } else if (routeParts[0] === 'student' && routeParts[1] === 'attempts' && routeParts[2]) {
      content = <PaperAttemptPage attemptId={routeParts[2]} />
    }
  }

  if (user.role === 'admin') {
    if (route === '/admin/imports') {
      content = <AdminImportPaperPage onOpenImport={(importId) => navigate(`/admin/imports/${importId}`)} />
    } else if (routeParts[0] === 'admin' && routeParts[1] === 'imports' && routeParts[2]) {
      content = <AdminImportReviewPage importId={routeParts[2]} onBack={() => navigate('/admin/imports')} />
    }
  }

  return (
    <AppShell
      user={user}
      onNavigate={navigate}
      onLogout={async () => {
        await logoutRequest()
        setUser(null)
        navigate('/')
      }}
    >
      {content}
    </AppShell>
  )
}
