import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Droplet, PackageSearch, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import TierProgress from '../components/TierProgress'
import Money from '../components/Money'
import { listPools } from '../lib/pools'
import { extractErrorMessage } from '../lib/api'

function PoolsSkeleton() {
  return (
    <div className="ledger-list">
      {[0, 1, 2].map((i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton skeleton-line" style={{ width: '45%' }} />
          <div className="skeleton skeleton-line" style={{ width: '25%', height: '10px' }} />
          <div className="skeleton" style={{ width: '100%', height: '8px', marginTop: '0.8rem' }} />
        </div>
      ))}
    </div>
  )
}

export default function PoolsPage() {
  const [pools, setPools] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listPools()
      .then(setPools)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load buying pools.')))
  }, [])

  return (
    <Layout>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1>Buying pools</h1>
          <span className="page-head__meta">{pools ? `${pools.length} active` : ''}</span>
        </div>
        <Link
          to="/intelligence"
          className="btn btn--ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10b981',
            fontSize: '12px',
            padding: '0.4rem 0.8rem',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          <Sparkles size={14} />
          Mandi Market Intelligence & Supplier Radar &rarr;
        </Link>
      </div>

      {error && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!pools && !error && <PoolsSkeleton />}

      {pools && pools.length === 0 && (
        <div className="empty-state">
          <PackageSearch size={32} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
          <h3>No active pools right now</h3>
          <p>Check back once your distributor opens a new group-buying round.</p>
        </div>
      )}

      {pools && pools.length > 0 && (
        <div className="ledger-list">
          {pools.map((pool) => (
            <Link key={pool.id} to={`/pools/${pool.id}`} className="ledger-row">
              <div className="pool-row__top">
                <div className="pool-row__heading">
                  <span className="pool-row__icon">
                    <Droplet size={18} />
                  </span>
                  <div>
                    <div className="pool-row__title">{pool.title}</div>
                    <div className="pool-row__sub">
                      {pool.productTitle} &middot; <StatusBadge status={pool.status} />
                    </div>
                  </div>
                </div>
                <div className="pool-row__price">
                  <div className="pool-row__price-value">
                    <Money value={pool.currentUnlockedPrice} />
                  </div>
                  <div className="pool-row__price-unit">per unit, current tier</div>
                </div>
              </div>
              <TierProgress pool={pool} />
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
