import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import Money from './Money'

export default function TierProgress({ pool }) {
  const tp = pool?.tierProgress
  const total = pool?.maxCapacity || 1
  const targetPercent = Math.min(100, Math.round(((pool?.currentQuantity || 0) / total) * 100))

  const [percent, setPercent] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setPercent(targetPercent))
    return () => cancelAnimationFrame(id)
  }, [targetPercent])

  if (!tp) return null

  return (
    <div className="tier-progress">
      <div className="tier-progress__track">
        <div className="tier-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="tier-progress__caption">
        {tp.nextTierLevel ? (
          <span>
            <strong>{tp.unitsNeededForNextTier}</strong> more units unlocks{' '}
            <Money value={tp.nextUnitPrice} />/unit
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} />
            Best price already unlocked
          </span>
        )}
        <span>
          {pool.currentQuantity} of {pool.maxCapacity} units
        </span>
      </div>
    </div>
  )
}
