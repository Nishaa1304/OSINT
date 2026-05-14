import { motion } from 'framer-motion'
import { getThreatColor } from '../../utils/riskScorer'

export default function GlowCard({ children, className = '', threat, onClick, animated = true }) {
  const c = threat ? getThreatColor(threat) : null

  const cardStyle = c ? {
    borderColor: c.border,
    boxShadow: `0 0 20px ${c.bg}, 0 4px 24px rgba(0,0,0,0.4)`,
  } : {}

  if (!animated) {
    return (
      <div
        onClick={onClick}
        className={`glass-card ${className} ${onClick ? 'cursor-pointer' : ''}`}
        style={cardStyle}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01, y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={cardStyle}
    >
      {children}
    </motion.div>
  )
}
