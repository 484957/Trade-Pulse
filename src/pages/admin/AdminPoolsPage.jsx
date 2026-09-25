import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import TableSkeleton from '../../components/TableSkeleton'
import StatusBadge from '../../components/StatusBadge'
import Money from '../../components/Money'
import { listPools, createPool } from '../../lib/adminPools'
import { listProducts } from '../../lib/adminProducts'
import { extractErrorMessage } from '../../lib/adminApi'

function toIsoOrNull(localDateTimeValue) {
  if (!localDateTimeValue) return null
  return new Date(localDateTimeValue).toISOString()
}

const emptyForm = {
  productId: '',
  title: '',
  targetMoq: '20',
  maxCapacity: '500',
  startTime: '',
  cutoffTime: '',
  freezeTime: '',
}

export default function AdminPoolsPage() {
  const navigate = useNavigate()
  const [pools, setPools] = useState(null)
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  function load() {
    listPools()
      .then(setPools)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load pools.')))
    listProducts().then(setProducts).catch(() => {})
  }

  useEffect(load, [])

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      await createPool({
        productId: form.productId,
        title: form.title,
        targetMoq: Number(form.targetMoq),
        maxCapacity: Number(form.maxCapacity),
        startTime: toIsoOrNull(form.startTime) || new Date().toISOString(),
        cutoffTime: toIsoOrNull(form.cutoffTime) || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        freezeTime: toIsoOrNull(form.freezeTime) || toIsoOrNull(form.cutoffTime) || new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
      })
      setFormSuccess(`Pool "${form.title}" created.`)
      setForm(emptyForm)
      load()
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create this pool.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminSidebar>
      <div className="page-head">
        <h1>Buying pools</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} />
          {showForm ? 'Close' : 'New pool'}
        </button>
      </div>

      {showForm && (
        <form className="panel" onSubmit={handleCreate}>
          {formError && (
            <div className="banner banner--error">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="banner banner--success">
              <CheckCircle2 size={16} />
              <span>{formSuccess}</span>
            </div>
          )}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="productId">Product</label>
              <select id="productId" value={form.productId} onChange={(e) => updateField('productId', e.target.value)} required>
                <option value="" disabled>
                  Select a product
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="title">Pool title</label>
              <input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="targetMoq">Target MOQ (units)</label>
              <input
                id="targetMoq"
                type="number"
                min="1"
                value={form.targetMoq}
                onChange={(e) => updateField('targetMoq', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="maxCapacity">Max capacity (units)</label>
              <input
                id="maxCapacity"
                type="number"
                min="1"
                value={form.maxCapacity}
                onChange={(e) => updateField('maxCapacity', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="cutoffTime">Cutoff time</label>
              <input
                id="cutoffTime"
                type="datetime-local"
                value={form.cutoffTime}
                onChange={(e) => updateField('cutoffTime', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="freezeTime">Freeze time (optional)</label>
              <input
                id="freezeTime"
                type="datetime-local"
                value={form.freezeTime}
                onChange={(e) => updateField('freezeTime', e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create pool'}
          </button>
        </form>
      )}

      {loadError && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {!pools && !loadError && <TableSkeleton columns={5} />}

      {pools && pools.length === 0 && <div className="empty-state">No pools yet. Create one from a registered product.</div>}

      {pools && pools.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Product</th>
                <th>Status</th>
                <th>Committed</th>
                <th>Current price</th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <tr key={pool.id} className="clickable" onClick={() => navigate(`/admin/pools/${pool.id}`)}>
                  <td>{pool.title}</td>
                  <td>{pool.productTitle}</td>
                  <td>
                    <StatusBadge status={pool.status} />
                  </td>
                  <td>
                    {pool.currentQuantity} / {pool.maxCapacity}
                  </td>
                  <td>
                    <Money value={pool.currentUnlockedPrice} />
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
