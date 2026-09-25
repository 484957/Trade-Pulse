import { useEffect, useState } from 'react'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import TableSkeleton from '../../components/TableSkeleton'
import { listMerchants, verifyMerchant } from '../../lib/adminMerchants'
import { extractErrorMessage } from '../../lib/adminApi'

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [verifyingId, setVerifyingId] = useState(null)
  const [rowError, setRowError] = useState('')

  function load() {
    listMerchants()
      .then(setMerchants)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load merchants.')))
  }

  useEffect(load, [])

  async function handleVerify(merchantId) {
    setRowError('')
    setVerifyingId(merchantId)
    try {
      await verifyMerchant(merchantId)
      load()
    } catch (err) {
      setRowError(extractErrorMessage(err, 'Could not verify this merchant.'))
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <AdminSidebar>
      <div className="page-head">
        <h1>Merchants</h1>
      </div>

      {loadError && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}
      {rowError && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{rowError}</span>
        </div>
      )}

      {!merchants && !loadError && <TableSkeleton columns={6} />}

      {merchants && merchants.length === 0 && <div className="empty-state">No merchants registered yet.</div>}

      {merchants && merchants.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Cluster zone</th>
                <th>Contact</th>
                <th>GSTIN</th>
                <th>Status</th>
                <th>KYC Action</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => {
                const isVer = m.isVerified ?? m.verified
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.businessName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>{m.addressLine}</div>
                    </td>
                    <td>{m.clusterZone}</td>
                    <td>{m.contactEmail}</td>
                    <td>{m.gstin}</td>
                    <td>
                      <span className={`badge badge--${isVer ? 'verified' : 'pending'}`}>
                        {isVer ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!isVer && (
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleVerify(m.id)}
                          disabled={verifyingId === m.id}
                        >
                          <ShieldCheck size={13} />
                          {verifyingId === m.id ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminSidebar>
  )
}
