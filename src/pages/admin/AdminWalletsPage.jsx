import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Wallet } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import TableSkeleton from '../../components/TableSkeleton'
import { listMerchants } from '../../lib/adminMerchants'
import { extractErrorMessage } from '../../lib/adminApi'

export default function AdminWalletsPage() {
  const navigate = useNavigate()
  const [merchants, setMerchants] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listMerchants()
      .then(setMerchants)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load merchants.')))
  }, [])

  return (
    <AdminSidebar>
      <div className="page-head">
        <h1>Merchant Wallets & Ledgers</h1>
      </div>

      {error && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!merchants && !error && <TableSkeleton columns={3} />}

      {merchants && merchants.length === 0 && (
        <div className="empty-state">
          <Wallet size={32} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
          No merchants registered yet.
        </div>
      )}

      {merchants && merchants.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Cluster Zone</th>
                <th>Contact Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="clickable" onClick={() => navigate(`/admin/wallets/${m.id}`)}>
                  <td>
                    <strong>{m.businessName}</strong>
                  </td>
                  <td>{m.clusterZone}</td>
                  <td>{m.contactEmail}</td>
                  <td>
                    <button className="btn btn--ghost btn--sm">
                      View Ledger & Credit &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSidebar>
  )
}
