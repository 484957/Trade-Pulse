import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, KeyRound } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import StatusBadge from '../../components/StatusBadge'
import Money from '../../components/Money'
import { getPool } from '../../lib/adminPools'
import { generateMasterPo, getMasterPoForPool, verifyDelivery } from '../../lib/adminFulfillment'
import { extractErrorMessage } from '../../lib/adminApi'

export default function AdminPoolDetailPage() {
  const { poolId } = useParams()
  const [pool, setPool] = useState(null)
  const [loadError, setLoadError] = useState('')

  const [generating, setGenerating] = useState(false)
  const [poError, setPoError] = useState('')
  const [masterPo, setMasterPo] = useState(null)

  const [otpInputs, setOtpInputs] = useState({})
  const [verifyingId, setVerifyingId] = useState(null)
  const [verifyMessages, setVerifyMessages] = useState({})

  function load() {
    getPool(poolId)
      .then(setPool)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load this pool.')))
    getMasterPoForPool(poolId)
      .then((po) => {
        if (po) setMasterPo(po)
      })
      .catch(() => {})
  }

  useEffect(load, [poolId])

  async function handleGeneratePo() {
    setPoError('')
    setGenerating(true)
    try {
      const result = await generateMasterPo(poolId)
      setMasterPo(result)
      load()
    } catch (err) {
      setPoError(extractErrorMessage(err, 'Could not generate the master PO.'))
    } finally {
      setGenerating(false)
    }
  }

  async function handleVerify(subInvoiceId, defaultOtp) {
    const otp = otpInputs[subInvoiceId] || defaultOtp
    setVerifyingId(subInvoiceId)
    setVerifyMessages((m) => ({ ...m, [subInvoiceId]: null }))
    try {
      const message = await verifyDelivery(subInvoiceId, otp)
      setVerifyMessages((m) => ({ ...m, [subInvoiceId]: { type: 'success', text: message } }))
      load()
    } catch (err) {
      setVerifyMessages((m) => ({
        ...m,
        [subInvoiceId]: { type: 'error', text: extractErrorMessage(err, 'Could not verify this delivery.') },
      }))
    } finally {
      setVerifyingId(null)
    }
  }

  if (loadError) {
    return (
      <AdminSidebar>
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
        <Link to="/admin/pools" className="btn btn--ghost">
          <ArrowLeft size={15} />
          Back to pools
        </Link>
      </AdminSidebar>
    )
  }

  if (!pool) {
    return (
      <AdminSidebar>
        <div className="skeleton" style={{ height: '28px', width: '40%', marginBottom: '1.4rem' }} />
        <div className="panel">
          <div className="skeleton" style={{ height: '60px', width: '100%' }} />
        </div>
      </AdminSidebar>
    )
  }

  const canGeneratePo = pool.status === 'OPEN' || pool.status === 'THRESHOLD_MET'
  const subInvoices = masterPo?.subInvoices ?? []

  return (
    <AdminSidebar>
      <div className="page-head">
        <div>
          <h1>{pool.title}</h1>
          <p className="page-head__meta">{pool.productTitle}</p>
        </div>
        <StatusBadge status={pool.status} />
      </div>

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label>Current price</label>
            <div className="num" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              <Money value={pool.currentUnlockedPrice} />
            </div>
          </div>
          <div className="field">
            <label>Committed</label>
            <div>{pool.currentQuantity} units</div>
          </div>
          <div className="field">
            <label>Target MOQ</label>
            <div>{pool.targetMoq} units</div>
          </div>
          <div className="field">
            <label>Max capacity</label>
            <div>{pool.maxCapacity} units</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <FileText size={18} />
          Master purchase order & Split Delivery
        </h2>

        {poError && (
          <div className="banner banner--error">
            <AlertCircle size={16} />
            <span>{poError}</span>
          </div>
        )}

        {!canGeneratePo && !masterPo && (
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.88rem' }}>
            A master PO can't be generated for this pool in its current state.
            Status: <StatusBadge status={pool.status} />
          </p>
        )}

        {canGeneratePo && !masterPo && (
          <div>
            <p style={{ color: 'var(--color-ink-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Generate a consolidated Master Purchase Order to tier-1 distributor and split order into B2B tax sub-invoices with 6-digit e-POD delivery OTPs.
            </p>
            <button className="btn btn--primary" onClick={handleGeneratePo} disabled={generating}>
              {generating ? 'Generating...' : 'Generate master PO & sub-invoices'}
            </button>
          </div>
        )}

        {masterPo && (
          <div>
            <p style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
              <strong>PO Ref:</strong> {masterPo.poReference} &middot; {masterPo.totalQuantity} units &middot;{' '}
              <Money value={masterPo.totalGrossAmount} /> total gross
            </p>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Merchant</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Dispatch</th>
                    <th>Delivery e-POD (OTP)</th>
                  </tr>
                </thead>
                <tbody>
                  {subInvoices.map((inv) => (
                    <tr key={inv.subInvoiceId}>
                      <td>{inv.invoiceNumber}</td>
                      <td>
                        <strong>{inv.merchantBusinessName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>{inv.clusterZone}</div>
                      </td>
                      <td>{inv.quantity}</td>
                      <td>
                        <Money value={inv.totalAmount} />
                      </td>
                      <td>
                        <StatusBadge status={inv.dispatchStatus || inv.status} />
                      </td>
                      <td>
                        {inv.dispatchStatus === 'DELIVERED' ? (
                          <span style={{ color: 'var(--color-positive)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={14} /> Delivered
                          </span>
                        ) : (
                          <div>
                            <div className="field-inline" style={{ marginBottom: '0.3rem' }}>
                              <input
                                placeholder={inv.deliveryOtp ? `OTP: ${inv.deliveryOtp}` : 'Enter OTP'}
                                value={otpInputs[inv.subInvoiceId] ?? (inv.deliveryOtp || '')}
                                onChange={(e) =>
                                  setOtpInputs((o) => ({ ...o, [inv.subInvoiceId]: e.target.value }))
                                }
                                style={{ maxWidth: 110, fontSize: '12px', padding: '0.25rem 0.5rem' }}
                              />
                              <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => handleVerify(inv.subInvoiceId, inv.deliveryOtp)}
                                disabled={verifyingId === inv.subInvoiceId}
                              >
                                <KeyRound size={13} />
                                Verify
                              </button>
                            </div>
                            {verifyMessages[inv.subInvoiceId] && (
                              <div
                                className={`banner banner--${verifyMessages[inv.subInvoiceId].type}`}
                                style={{ margin: 0, fontSize: '0.76rem', padding: '0.4rem 0.6rem' }}
                              >
                                {verifyMessages[inv.subInvoiceId].type === 'success' ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <AlertCircle size={13} />
                                )}
                                <span>{verifyMessages[inv.subInvoiceId].text}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Link to="/admin/pools" className="btn btn--ghost" style={{ marginTop: '1.5rem' }}>
        <ArrowLeft size={15} />
        Back to pools
      </Link>
    </AdminSidebar>
  )
}
