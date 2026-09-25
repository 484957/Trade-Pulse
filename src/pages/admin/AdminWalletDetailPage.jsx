import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Money from '../../components/Money'
import { getMerchantBalance, depositFunds } from '../../lib/adminWallet'
import { extractErrorMessage } from '../../lib/adminApi'

export default function AdminWalletDetailPage() {
  const { merchantId } = useParams()
  const [overview, setOverview] = useState(null)
  const [loadError, setLoadError] = useState('')

  const [amount, setAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [depositError, setDepositError] = useState('')
  const [depositSuccess, setDepositSuccess] = useState('')

  function load() {
    getMerchantBalance(merchantId)
      .then(setOverview)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load this wallet.')))
  }

  useEffect(load, [merchantId])

  async function handleDeposit(e) {
    e.preventDefault()
    setDepositError('')
    setDepositSuccess('')
    setDepositing(true)
    try {
      await depositFunds(merchantId, Number(amount), 'ADMIN-CREDIT')
      setDepositSuccess(`Deposit of ₹${Number(amount).toLocaleString('en-IN')} recorded on this merchant's behalf.`)
      setAmount('')
      load()
    } catch (err) {
      setDepositError(extractErrorMessage(err, 'Could not process this deposit.'))
    } finally {
      setDepositing(false)
    }
  }

  return (
    <AdminSidebar>
      <div className="page-head">
        <h1>Merchant Wallet</h1>
      </div>

      {loadError && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {!overview && !loadError && (
        <div className="stat-grid">
          {[0, 1, 2].map((i) => (
            <div className="stat-card" key={i}>
              <div className="skeleton skeleton-line" style={{ width: '50%', height: '12px', marginBottom: '0.6rem' }} />
              <div className="skeleton" style={{ height: '26px', width: '75%' }} />
            </div>
          ))}
        </div>
      )}

      {overview && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card__label">Available</div>
            <div className="stat-card__value" style={{ color: 'var(--color-positive)' }}>
              <Money value={overview.availableBalance} />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">In escrow</div>
            <div className="stat-card__value" style={{ color: 'var(--color-accent-strong)' }}>
              <Money value={overview.escrowHoldBalance} />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Total</div>
            <div className="stat-card__value">
              <Money value={overview.totalBalance} />
            </div>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.9rem' }}>Credit this wallet</h2>
        <form onSubmit={handleDeposit} style={{ maxWidth: 320 }}>
          {depositError && (
            <div className="banner banner--error">
              <AlertCircle size={16} />
              <span>{depositError}</span>
            </div>
          )}
          {depositSuccess && (
            <div className="banner banner--success">
              <CheckCircle2 size={16} />
              <span>{depositSuccess}</span>
            </div>
          )}
          <div className="field">
            <label htmlFor="amount">Amount (INR)</label>
            <input
              id="amount"
              type="number"
              min="1"
              step="100"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={depositing}>
            {depositing ? 'Processing...' : 'Deposit funds as Admin'}
          </button>
        </form>
      </div>

      <Link to="/admin/wallets" className="btn btn--ghost" style={{ marginTop: '1.5rem' }}>
        <ArrowLeft size={15} />
        Back to wallets
      </Link>
    </AdminSidebar>
  )
}
