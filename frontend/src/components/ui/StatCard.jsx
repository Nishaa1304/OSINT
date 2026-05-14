import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon: Icon, color = 'cyan', trend, subtitle, loading }) {
  const colorMap = {
    cyan:   { text: 'text-cyber-cyan',   bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.2)',  glow: 'glow-cyan'  },
    blue:   { text: 'text-blue-400',     bg: 'rgba(0,102,255,0.1)',  border: 'rgba(0,102,255,0.2)',  glow: 'glow-blue'  },
    green:  { text: 'text-cyber-green',  bg: 'rgba(0,255,136,0.1)',  border: 'rgba(0,255,136,0.2)',  glow: 'glow-green' },
    red:    { text: 'text-cyber-red',    bg: 'rgba(255,51,102,0.1)', border: 'rgba(255,51,102,0.2)', glow: 'glow-red'   },
    orange: { text: 'text-cyber-orange', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.2)', glow: 'glow-orange'},
    yellow: { text: 'text-yellow-400',   bg: 'rgba(255,214,10,0.1)', border: 'rgba(255,214,10,0.2)', glow: ''           },
  }
  const c = colorMap[color] || colorMap.cyan

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="glass-card p-5 cursor-default border-glow relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at top right, ${c.bg}, transparent 70%)` }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-cyber-muted font-medium uppercase tracking-wider mb-2">{title}</p>
          <motion.p
            className={`text-3xl font-bold font-mono ${c.text}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value ?? '—'}
          </motion.p>
          {subtitle && <p className="text-xs text-cyber-muted mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
              <span>{trend >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.glow}`}
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          {Icon && <Icon size={20} className={c.text} />}
        </div>
      </div>
    </motion.div>
  )
}
