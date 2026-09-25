export default function TableSkeleton({ columns = 4, rows = 3 }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c}>
                  <div className="skeleton" style={{ height: '14px', width: c === 0 ? '80%' : '55%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
