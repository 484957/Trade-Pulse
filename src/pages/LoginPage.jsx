import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Boxes, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/api'

export default function LoginPage() {
  const { login, loginWithGoogle, loginDirectGoogleUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('omsai.vasai@tradepulse.io')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/pools')
    } catch (err) {
      console.warn('Google sign in error:', err)
      setError(extractErrorMessage(err, 'Failed to sign in with Google.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleDirectGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginDirectGoogleUser('rehankhan0214e@gmail.com', 'Rehan Khan')
      navigate('/pools')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to sign in with Google.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/pools')
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not log in. Check your email and password.'))
    } finally {
      setSubmitting(false)
    }
  }

  function setDemoUser(email, pass) {
    setUsername(email)
    setPassword(pass)
  }

  return (
    <div className="auth-screen">
      <div className="auth-layout">
        <div className="auth-hero">
          <svg className="auth-hero__crates" viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g opacity="0.5">
              <rect x="30" y="380" width="90" height="90" rx="4" stroke="#3a4c74" strokeWidth="1.5" />
              <rect x="128" y="410" width="70" height="60" rx="4" stroke="#3a4c74" strokeWidth="1.5" />
              <rect x="30" y="290" width="70" height="80" rx="4" stroke="#3a4c74" strokeWidth="1.5" />
              <rect x="112" y="300" width="55" height="70" rx="4" stroke="#3a4c74" strokeWidth="1.5" />
              <circle cx="300" cy="120" r="70" stroke="#d9932e" strokeWidth="1.5" opacity="0.35" />
              <circle cx="300" cy="120" r="46" stroke="#d9932e" strokeWidth="1.5" opacity="0.55" />
              <line x1="0" y1="470" x2="400" y2="470" stroke="#3a4c74" strokeWidth="1.5" />
            </g>
          </svg>
          <div className="auth-hero__content">
            <div className="auth-hero__eyebrow">
              <Boxes size={16} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
              Group-buying, unlocked together
            </div>
            <h2>Every unit your neighbours order brings your price down.</h2>
          </div>
          <div className="auth-hero__stats">
            <div>
              <div className="auth-hero__stat-value">4</div>
              <div className="auth-hero__stat-label">pricing tiers per pool</div>
            </div>
            <div>
              <div className="auth-hero__stat-value">Vasai-Virar</div>
              <div className="auth-hero__stat-label">cluster zones covered</div>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-card">
            <div className="auth-card__brand">
              Trade<span>Pulse</span>
            </div>
            <p className="auth-card__tagline">Log in to your merchant account</p>

            {error && (
              <div className="banner banner--error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="username">Email</label>
                <input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary btn--full" disabled={submitting || googleLoading}>
                {submitting ? 'Logging in...' : 'Log in as Merchant'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--color-ink-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ padding: '0 0.6rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || submitting}
              className="btn btn--ghost btn--full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-ink)',
                padding: '0.6rem 1rem',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
            </button>

            <button
              type="button"
              onClick={handleDirectGoogleSignIn}
              disabled={googleLoading || submitting}
              className="btn btn--ghost btn--full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                border: '1px dashed var(--color-primary)',
                background: 'rgba(59, 130, 246, 0.05)',
                color: 'var(--color-primary)',
                padding: '0.45rem 0.8rem',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <span>⚡ <strong>1-Click Google Sign-in:</strong> rehankhan0214e@gmail.com</span>
            </button>

            <div style={{ marginTop: '1.2rem', padding: '0.8rem', background: 'var(--color-surface-sunken)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Quick Demo Merchants
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ fontSize: '12px', padding: '0.3rem 0.5rem', justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => setDemoUser('omsai.vasai@tradepulse.io', 'Password123!')}
                >
                  🏪 <strong>Om Sai Kirana</strong> (Vasai West)
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ fontSize: '12px', padding: '0.3rem 0.5rem', justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => setDemoUser('manvelpada.mart@tradepulse.io', 'Password123!')}
                >
                  🏪 <strong>Manvelpada Supermarket</strong> (Virar East)
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link
                to="/admin/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '13px',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <Shield size={14} />
                Switch to Admin Console &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
