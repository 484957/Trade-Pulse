export function formatMoney(value) {
  const n = Number(value ?? 0)
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Money({ value, prefix = '\u20B9' }) {
  return (
    <span className="num">
      {prefix}
      {formatMoney(value)}
    </span>
  )
}
