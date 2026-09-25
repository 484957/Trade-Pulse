import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Plus } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import Money from '../../components/Money'
import { getProduct, addTier } from '../../lib/adminProducts'
import { extractErrorMessage } from '../../lib/adminApi'

const emptyTier = { tierLevel: '', minVolumeThreshold: '', unitPrice: '' }

export default function AdminProductDetailPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loadError, setLoadError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [tier, setTier] = useState(emptyTier)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  function load() {
    getProduct(productId)
      .then(setProduct)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load this product.')))
  }

  useEffect(load, [productId])

  async function handleAddTier(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      await addTier(productId, {
        tierLevel: Number(tier.tierLevel),
        minVolumeThreshold: Number(tier.minVolumeThreshold),
        unitPrice: Number(tier.unitPrice),
      })
      setFormSuccess('Pricing tier added.')
      setTier(emptyTier)
      load()
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not add this tier.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <AdminSidebar>
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
        <Link to="/admin/products" className="btn btn--ghost">
          <ArrowLeft size={15} />
          Back to products
        </Link>
      </AdminSidebar>
    )
  }

  if (!product) {
    return (
      <AdminSidebar>
        <div className="skeleton" style={{ height: '28px', width: '40%', marginBottom: '1.4rem' }} />
        <div className="skeleton" style={{ height: '100px', width: '100%' }} />
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="page-head">
        <div>
          <h1>{product.title}</h1>
          <p className="page-head__meta">
            {product.sku} &middot; HSN {product.hsnCode} &middot; GST {product.gstRate}%
          </p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} />
          {showForm ? 'Close' : 'Add tier'}
        </button>
      </div>

      {showForm && (
        <form className="panel" onSubmit={handleAddTier}>
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
              <label htmlFor="tierLevel">Tier level</label>
              <input
                id="tierLevel"
                type="number"
                min="1"
                value={tier.tierLevel}
                onChange={(e) => setTier((t) => ({ ...t, tierLevel: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="minVolumeThreshold">Min volume threshold (units)</label>
              <input
                id="minVolumeThreshold"
                type="number"
                min="1"
                value={tier.minVolumeThreshold}
                onChange={(e) => setTier((t) => ({ ...t, minVolumeThreshold: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="unitPrice">Unit price</label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={tier.unitPrice}
                onChange={(e) => setTier((t) => ({ ...t, unitPrice: e.target.value }))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add tier'}
          </button>
        </form>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Min volume</th>
              <th>Unit price</th>
            </tr>
          </thead>
          <tbody>
            {(!product.tiers || product.tiers.length === 0) && (
              <tr>
                <td colSpan={3} style={{ color: 'var(--color-ink-muted)' }}>
                  No pricing tiers yet.
                </td>
              </tr>
            )}
            {product.tiers?.map((t) => (
              <tr key={t.id}>
                <td>Tier {t.tierLevel}</td>
                <td>{t.minVolumeThreshold} units</td>
                <td>
                  <Money value={t.unitPrice} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link to="/admin/products" className="btn btn--ghost" style={{ marginTop: '1.5rem' }}>
        <ArrowLeft size={15} />
        Back to products
      </Link>
    </AdminSidebar>
  )
}
