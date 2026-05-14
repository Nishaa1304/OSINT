import { motion } from 'framer-motion'
import { getThreatColor, getRiskBarColor } from '../../utils/riskScorer'

export default function ThreatMeter({ score = 0, level = 'SAFE', label = 'Risk Score', animated = true }) {
  const c = getThreatColor(level)
  const barColor = getRiskBarColor(score)

  const levelEmoji = { SAFE: '✅', LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴' }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-cyber-muted font-medium uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">{levelEmoji[level]}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full`}
            style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}>
            {level}
          </span>
        </div>
      </div>

      {/* Score number */}
      <div className="flex items-end gap-2">
        <motion.span
          className="text-4xl font-bold font-mono"
          style={{ color: c.text }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-cyber-muted text-sm mb-1">/100</span>
      </div>

      {/* Bar */}
      <div className="threat-meter-bar">
        <motion.div
          className="threat-meter-fill"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-cyber-muted">
        <span>SAFE</span>
        <span>LOW</span>
        <span>MEDIUM</span>
        <span>HIGH</span>
        <span>CRITICAL</span>
      </div>
    </div>
  )
}
