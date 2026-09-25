import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Users } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { listProducts } from '../../lib/adminProducts'
import { listPools } from '../../lib/adminPools'
import { listMerchants } from '../../lib/adminMerchants'

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    Promise.all([listProducts(), listPools(), listMerchants()])
      .then(([products, pools, merchants]) => {
        setCounts({
          products: products.length,
          openPools: pools.filter((p) => p.status === 'OPEN' || p.status === 'THRESHOLD_MET').length,
          totalPools: pools.length,
          merchants: merchants.length,
        })
      })
      .catch(() => setCounts({ products: 0, openPools: 0, totalPools: 0, merchants: 0 }))
  }, [])

  return (
    <AdminSidebar>
      <div className="page-head">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">
            <Package size={14} />
            Products
          </div>
          <div className="stat-card__value">
            {counts ? counts.products : <span className="skeleton" style={{ display: 'inline-block', width: '2rem', height: '1.3rem' }} />}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">
            <ShoppingCart size={14} />
            Open pools
          </div>
          <div className="stat-card__value">
            {counts ? `${counts.openPools} / ${counts.totalPools}` : <span className="skeleton" style={{ display: 'inline-block', width: '2rem', height: '1.3rem' }} />}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">
            <Users size={14} />
            Merchants
          </div>
          <div className="stat-card__value">
            {counts ? counts.merchants : <span className="skeleton" style={{ display: 'inline-block', width: '2rem', height: '1.3rem' }} />}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.8rem' }}>Quick actions</h2>
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn--ghost">
            Manage products
          </Link>
          <Link to="/admin/pools" className="btn btn--ghost">
            Manage buying pools
          </Link>
          <Link to="/admin/merchants" className="btn btn--ghost">
            Verify merchants
          </Link>
        </div>
      </div>
    </AdminSidebar>
  )
}
