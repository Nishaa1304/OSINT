import { getThreatColor } from '../../utils/riskScorer'

export default function ThreatBadge({ level, size = 'sm' }) {
  if (!level) return null
  const c = getThreatColor(level)
  const sizes = { xs: 'text-[9px] px-1.5 py-0.5', sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1' }

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full ${sizes[size] || sizes.sm}`}
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {level}
    </span>
  )
}
