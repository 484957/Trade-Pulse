import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import TableSkeleton from '../../components/TableSkeleton'
import Money from '../../components/Money'
import { listProducts, createProduct } from '../../lib/adminProducts'
import { extractErrorMessage } from '../../lib/adminApi'

const emptyForm = {
  distributorId: '',
  sku: '',
  title: '',
  hsnCode: '',
  gstRate: '5.00',
  baseUnit: 'tin',
  mrp: '',
}

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  function load() {
    listProducts()
      .then(setProducts)
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load products.')))
  }

  useEffect(load, [])

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function generateDistributorId() {
    updateField('distributorId', crypto.randomUUID())
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      await createProduct({
        ...form,
        gstRate: Number(form.gstRate),
        mrp: Number(form.mrp),
      })
      setFormSuccess(`Product "${form.title}" registered.`)
      setForm(emptyForm)
      load()
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create this product.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminSidebar>
      <div className="page-head">
        <h1>Products</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} />
          {showForm ? 'Close' : 'New product'}
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
              <label htmlFor="title">Product title</label>
              <input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="sku">SKU</label>
              <input id="sku" value={form.sku} onChange={(e) => updateField('sku', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="baseUnit">Base unit</label>
              <input id="baseUnit" value={form.baseUnit} onChange={(e) => updateField('baseUnit', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="hsnCode">HSN code</label>
              <input id="hsnCode" value={form.hsnCode} onChange={(e) => updateField('hsnCode', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="gstRate">GST rate (%)</label>
              <input
                id="gstRate"
                type="number"
                step="0.01"
                value={form.gstRate}
                onChange={(e) => updateField('gstRate', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="mrp">MRP (entry price)</label>
              <input id="mrp" type="number" step="0.01" value={form.mrp} onChange={(e) => updateField('mrp', e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="distributorId">Distributor ID</label>
            <div className="field-inline">
              <input
                id="distributorId"
                value={form.distributorId}
                onChange={(e) => updateField('distributorId', e.target.value)}
                placeholder="Generate a placeholder distributor UUID"
                required
              />
              <button type="button" className="btn btn--ghost btn--sm" onClick={generateDistributorId}>
                Generate
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create product'}
          </button>
        </form>
      )}

      {loadError && (
        <div className="banner banner--error">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {!products && !loadError && <TableSkeleton columns={6} />}

      {products && products.length === 0 && (
        <div className="empty-state">No products registered yet. Create one to start a buying pool.</div>
      )}

      {products && products.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>SKU</th>
                <th>Base unit</th>
                <th>GST</th>
                <th>MRP / entry price</th>
                <th>Tiers</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="clickable" onClick={() => navigate(`/admin/products/${p.id}`)}>
                  <td>{p.title}</td>
                  <td>{p.sku}</td>
                  <td>{p.baseUnit}</td>
                  <td>{p.gstRate}%</td>
                  <td>
                    <Money value={p.mrp} />
                  </td>
                  <td>{p.tiers?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSidebar>
  )
}
