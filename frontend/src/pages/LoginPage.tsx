import { useState } from 'react'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export function LoginPage({ onLogin }: { onLogin: (payload: { email: string; password: string }) => Promise<void> }) {
  const [email, setEmail] = useState('student@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="landing-layout">
      <section className="hero-copy">
        <p className="eyebrow">Production-structured exam prep</p>
        <h1>Whole-paper practice, draft-only imports, and post-submission review.</h1>
        <p className="hero-text">Students complete an entire paper before results are revealed. Admins upload papers and mark schemes into a review-first import pipeline before publication.</p>
        <div className="feature-grid">
          <div className="panel compact-panel">Stable API responses</div>
          <div className="panel compact-panel">Attempt lifecycle states</div>
          <div className="panel compact-panel">Import preview and approval</div>
        </div>
      </section>
      <section className="panel auth-panel">
        <h2>Sign in</h2>
        <p className="subtle-text">Demo credentials: student@example.com / password or admin@example.com / password.</p>
        <form
          className="stack-md"
          onSubmit={async (event) => {
            event.preventDefault()
            setError(null)
            setLoading(true)
            try {
              const payload = schema.parse({ email, password })
              await onLogin(payload)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Unable to sign in.')
            } finally {
              setLoading(false)
            }
          }}
        >
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </div>
  )
}
