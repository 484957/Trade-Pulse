import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, PiggyBank, History } from 'lucide-react'
import Layout from '../components/Layout'
import Money from '../components/Money'
import { useAuth } from '../context/AuthContext'
import { getMerchantBalance, depositFunds } from '../lib/wallet'
import { api, extractErrorMessage } from '../lib/api'

function WalletSkeleton() {
  return (
    <div className="wallet-grid">
      {[0, 1, 2].map((i) => (
        <div className="card wallet-stat" key={i}>
          <div className="skeleton skeleton-line" style={{ width: '50%' }} />
          <div className="skeleton" style={{ height: '28px', width: '75%' }} />
        </div>
      ))}
    </div>
  )
}

export default function WalletPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loadError, setLoadError] = useState('')

  const [amount, setAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [depositError, setDepositError] = useState('')
  const [depositSuccess, setDepositSuccess] = useState('')

  function loadBalance() {
    getMerchantBalance(user.merchantId)
      .then(setOverview)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load wallet balance.')))

    api.get('/api/v1/ledger/transactions')
      .then((res) => setTransactions(res.data.data || []))
      .catch(() => {})
  }

  useEffect(loadBalance, [user.merchantId])

  async function handleDeposit(e) {
    e.preventDefault()
    setDepositError('')
    setDepositSuccess('')
    setDepositing(true)
    try {
      await depositFunds(user.merchantId, Number(amount))
      setDepositSuccess(`Deposit of ₹${Number(amount).toLocaleString('en-IN')} recorded successfully.`)
      setAmount('')
      loadBalance()
    } catch (err) {
      setDepositError(extractErrorMessage(err, 'Could not process this deposit.'))
    } finally {
      setDepositing(false)
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <h1>Merchant Wallet</h1>
      </div>

      {loadError && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {!overview && !loadError && <WalletSkeleton />}

      {overview && (
        <div className="wallet-grid">
          <div className="card wallet-stat wallet-stat--available">
            <div className="wallet-stat__label">Available Balance</div>
            <div className="wallet-stat__value">
              <Money value={overview.availableBalance} />
            </div>
          </div>
          <div className="card wallet-stat wallet-stat--escrow">
            <div className="wallet-stat__label">In Escrow Hold</div>
            <div className="wallet-stat__value">
              <Money value={overview.escrowHoldBalance} />
            </div>
          </div>
          <div className="card wallet-stat">
            <div className="wallet-stat__label">Total Worth</div>
            <div className="wallet-stat__value">
              <Money value={overview.totalBalance} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <PiggyBank size={19} />
            Add funds
          </h2>
          <form onSubmit={handleDeposit} style={{ background: '#fff', padding: '1.2rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
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
                min="100"
                step="100"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={depositing}>
              {depositing ? 'Processing...' : 'Deposit funds'}
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <History size={19} />
            Ledger Activity
          </h2>
          {transactions.length === 0 ? (
            <div className="card" style={{ padding: '1.5rem', color: 'var(--color-ink-muted)' }}>
              No recent transactions recorded.
            </div>
          ) : (
            <div className="ledger-list" style={{ marginTop: 0 }}>
              {transactions.slice(0, 5).map((txn) => (
                <div key={txn.transactionId} className="ledger-row" style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{txn.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>
                        Ref: {txn.transactionRef} &middot; {new Date(txn.postedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 600 }}>
                      <Money value={txn.entries?.[0]?.amount || 0} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
