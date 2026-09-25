import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <h1>404 &mdash; Page not found</h1>
      <p style={{ marginTop: '0.8rem', color: 'var(--color-ink-muted)' }}>The page you requested does not exist.</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/pools" className="btn btn--primary">
          Merchant Pools
        </Link>
        <Link to="/admin" className="btn btn--ghost">
          Admin Console
        </Link>
      </div>
    </div>
  )
}
