import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Package, Receipt, Shield, Sparkles, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          Trade<span className="topbar__brand-mark">Pulse</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              marginLeft: '8px',
              padding: '2px 6px',
              background: 'var(--color-primary-tint)',
              color: 'var(--color-primary)',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}
          >
            MERCHANT
          </span>
        </div>
        <nav className="topbar__nav">
          <NavLink to="/pools" className={({ isActive }) => `topbar__link${isActive ? ' active' : ''}`}>
            <Package size={15} />
            Buying pools
          </NavLink>
          <NavLink to="/intelligence" className={({ isActive }) => `topbar__link${isActive ? ' active' : ''}`}>
            <Sparkles size={15} style={{ color: '#10b981' }} />
            Market Intelligence
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `topbar__link${isActive ? ' active' : ''}`}>
            <Receipt size={15} />
            Invoices
          </NavLink>
          <NavLink to="/wallet" className={({ isActive }) => `topbar__link${isActive ? ' active' : ''}`}>
            <Wallet size={15} />
            Wallet
          </NavLink>
          <NavLink
            to="/admin"
            className="topbar__link"
            style={{
              marginLeft: '0.5rem',
              border: '1px dashed var(--color-border-strong)',
              background: '#fff',
            }}
          >
            <Shield size={14} />
            Admin Console &rarr;
          </NavLink>
        </nav>
        <div className="topbar__user" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || user.username}
              style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--color-border)' }}
            />
          ) : null}
          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user?.username}>
            {user?.displayName || user?.username}
          </span>
          <button className="topbar__logout" onClick={handleLogout}>
            <LogOut size={13} />
            Log out
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  )
}
