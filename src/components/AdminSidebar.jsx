import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard, LogOut, Package, ShoppingCart, Sparkles, Users, Wallet } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminSidebar({ children }) {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          Trade<span>Pulse</span>
          <span className="sidebar__console-label">ADMIN CONSOLE</span>
        </div>
        <nav className="sidebar__nav">
          <NavLink
            to="/pools"
            className="sidebar__link"
            style={{
              marginBottom: '0.8rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#faedd6',
            }}
          >
            <ArrowLeft size={15} />
            <span>Merchant Portal</span>
          </NavLink>
          <NavLink to="/admin" end className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}>
            <Package size={16} />
            <span>Products</span>
          </NavLink>
          <NavLink to="/admin/pools" className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}>
            <ShoppingCart size={16} />
            <span>Buying pools</span>
          </NavLink>
          <NavLink to="/admin/merchants" className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}>
            <Users size={16} />
            <span>Merchants</span>
          </NavLink>
          <NavLink to="/admin/wallets" className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}>
            <Wallet size={16} />
            <span>Wallets</span>
          </NavLink>
          <NavLink to="/admin/intelligence" className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}>
            <Sparkles size={16} style={{ color: '#34d399' }} />
            <span>Market Intelligence</span>
          </NavLink>
        </nav>
        <div className="sidebar__footer">
          <div>{user?.username}</div>
          <button className="sidebar__logout" onClick={handleLogout}>
            <LogOut size={13} />
            Log out
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <div className="page">{children}</div>
      </main>
    </div>
  )
}
