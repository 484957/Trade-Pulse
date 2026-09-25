import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import TierProgress from '../components/TierProgress'
import Money from '../components/Money'
import { useAuth } from '../context/AuthContext'
import { getPool, commitToPool } from '../lib/pools'
import { extractErrorMessage } from '../lib/api'

export default function PoolDetailPage() {
  const { poolId } = useParams()
  const { user } = useAuth()

  const [pool, setPool] = useState(null)
  const [loadError, setLoadError] = useState('')

  const [quantity, setQuantity] = useState(10)
  const [committing, setCommitting] = useState(false)
  const [commitError, setCommitError] = useState('')
  const [commitResult, setCommitResult] = useState(null)

  function loadPool() {
    getPool(poolId)
      .then(setPool)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load this pool.')))
  }

  useEffect(loadPool, [poolId])

  async function handleCommit(e) {
    e.preventDefault()
    setCommitError('')
    setCommitResult(null)
    setCommitting(true)
    try {
      const result = await commitToPool(poolId, user.merchantId, Number(quantity))
      setCommitResult(result)
      loadPool() // refresh tier progress and pricing after the commit
    } catch (err) {
      setCommitError(extractErrorMessage(err, 'Could not commit to this pool.'))
    } finally {
      setCommitting(false)
    }
  }

  if (loadError) {
    return (
      <Layout>
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
        <Link to="/pools" className="btn btn--ghost">
          <ArrowLeft size={15} />
          Back to pools
        </Link>
      </Layout>
    )
  }

  if (!pool) {
    return (
      <Layout>
        <div className="skeleton" style={{ height: '32px', width: '55%', marginBottom: '1.6rem' }} />
        <div className="card" style={{ padding: '1.4rem 1.5rem' }}>
          <div className="skeleton" style={{ height: '8px', width: '100%', marginBottom: '1.2rem' }} />
          <div className="skeleton" style={{ height: '60px', width: '100%' }} />
        </div>
      </Layout>
    )
  }

  const canCommit = pool.status === 'OPEN' || pool.status === 'THRESHOLD_MET'

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>{pool.title}</h1>
          <p className="page-head__meta">
            {pool.productTitle} ({pool.productSku})
          </p>
        </div>
        <StatusBadge status={pool.status} />
      </div>

      <div className="card" style={{ padding: '1.4rem 1.5rem' }}>
        <TierProgress pool={pool} />
        <dl className="detail-grid">
          <div className="detail-grid__item">
            <dt>Current price</dt>
            <dd>
              <Money value={pool.currentUnlockedPrice} />
            </dd>
          </div>
          <div className="detail-grid__item">
            <dt>Committed</dt>
            <dd>{pool.currentQuantity} units</dd>
          </div>
          <div className="detail-grid__item">
            <dt>Minimum order (MOQ)</dt>
            <dd>{pool.targetMoq} units</dd>
          </div>
          <div className="detail-grid__item">
            <dt>Max capacity</dt>
            <dd>{pool.maxCapacity} units</dd>
          </div>
        </dl>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Commit your order volume</h2>

        {!canCommit && (
          <div
            className="banner"
            style={{ marginTop: '0.9rem', background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}
          >
            This pool is {pool.status.toLowerCase().replace('_', ' ')} and no longer accepting new commitments.
          </div>
        )}

        {canCommit && (
          <form onSubmit={handleCommit} style={{ maxWidth: 360, marginTop: '0.9rem' }}>
            {commitError && (
              <div className="banner banner--error">
                <AlertCircle size={16} />
                <span>{commitError}</span>
              </div>
            )}
            {commitResult && (
              <div className="banner banner--success">
                <CheckCircle2 size={16} />
                <span>
                  Locked {commitResult.quantity} units at <Money value={commitResult.lockedUnitPrice} />/unit.
                  Escrow hold: <Money value={commitResult.totalHoldAmount} />.
                </span>
              </div>
            )}
            <div className="field">
              <label htmlFor="quantity">Quantity (units)</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={pool.maxCapacity - pool.currentQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <span style={{ fontSize: '12px', color: 'var(--color-ink-faint)', marginTop: '0.3rem', display: 'block' }}>
                Est. hold: <Money value={(Number(quantity) || 0) * pool.currentUnlockedPrice} />
              </span>
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={committing}>
              {committing ? 'Committing...' : 'Commit to pool'}
            </button>
          </form>
        )}
      </div>

      <Link to="/pools" className="btn btn--ghost" style={{ marginTop: '2rem' }}>
        <ArrowLeft size={15} />
        Back to pools
      </Link>
    </Layout>
  )
}
