import { useEffect, useState } from 'react'
import { AlertCircle, Key, Receipt } from 'lucide-react'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Money from '../components/Money'
import { useAuth } from '../context/AuthContext'
import { api, extractErrorMessage } from '../lib/api'

async function getMyInvoices(merchantId) {
  const response = await api.get(`/api/v1/fulfillment/sub-invoices/merchant/${merchantId}`)
  return response.data.data
}

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyInvoices(user.merchantId)
      .then(setInvoices)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load your invoices.')))
  }, [user.merchantId])

  return (
    <Layout>
      <div className="page-head">
        <h1>Tax Invoices & e-POD</h1>
        <span className="page-head__meta">{invoices ? `${invoices.length} total` : ''}</span>
      </div>

      {error && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!invoices && !error && <div className="loading-state">Loading invoices...</div>}

      {invoices && invoices.length === 0 && (
        <div className="empty-state">
          <Receipt size={32} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
          <h3>No invoices yet</h3>
          <p>Invoices appear here once a pool you've committed to has its purchase order issued by the admin operations team.</p>
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="ledger-list">
          {invoices.map((inv) => (
            <div className="ledger-row" key={inv.subInvoiceId}>
              <div className="pool-row__top">
                <div>
                  <div className="pool-row__title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>{inv.invoiceNumber}</span>
                    <StatusBadge status={inv.dispatchStatus || inv.status} />
                  </div>
                  <div className="pool-row__sub" style={{ marginTop: '0.3rem' }}>
                    {inv.quantity} units &middot; Base: <Money value={inv.taxableAmount} /> &middot; CGST: <Money value={inv.cgstAmount} /> &middot; SGST: <Money value={inv.sgstAmount} />
                  </div>
                </div>
                <div className="pool-row__price">
                  <div className="pool-row__price-value">
                    <Money value={inv.totalAmount} />
                  </div>
                  <div className="pool-row__price-unit">total, incl. GST</div>
                </div>
              </div>

              {inv.deliveryOtp && (
                <div
                  style={{
                    marginTop: '0.8rem',
                    padding: '0.5rem 0.8rem',
                    background: 'var(--color-surface-sunken)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-ink-muted)' }}>
                    <Key size={14} />
                    <strong>Delivery OTP (e-POD):</strong> Share with delivery driver on handover
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'var(--color-primary)',
                      padding: '2px 8px',
                      background: '#fff',
                      borderRadius: '3px',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {inv.deliveryOtp}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
