const LABELS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  THRESHOLD_MET: 'Threshold met',
  LOCKED: 'Locked',
  PO_GENERATED: 'PO generated',
  PO_ISSUED: 'PO issued',
  FULFILLED: 'Fulfilled',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  HOLD_PENDING: 'Hold pending',
  CONFIRMED: 'Confirmed',
  SETTLED: 'Settled',
  REFUNDED: 'Refunded',
  GENERATED: 'Generated',
  ISSUED: 'Issued',
  READY_FOR_DISPATCH: 'Ready for dispatch',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  PARTIALLY_DELIVERED: 'Partially delivered',
  FAILED: 'Failed',
  PENDING_DELIVERY: 'Pending delivery',
  PAID: 'Paid',
}

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase().replace(/_/g, '-')
  return <span className={`badge badge--${key}`}>{LABELS[status] || status}</span>
}
