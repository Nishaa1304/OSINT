export const THREAT_LEVELS = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const THREAT_COLORS = {
  SAFE:     { text: '#00ff88', bg: 'rgba(0,255,136,0.1)',  border: 'rgba(0,255,136,0.3)',  badge: 'badge-safe'     },
  LOW:      { text: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.3)',  badge: 'badge-low'      },
  MEDIUM:   { text: '#ffd60a', bg: 'rgba(255,214,10,0.1)', border: 'rgba(255,214,10,0.3)', badge: 'badge-medium'   },
  HIGH:     { text: '#ff6b35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)', badge: 'badge-high'     },
  CRITICAL: { text: '#ff3366', bg: 'rgba(255,51,102,0.1)', border: 'rgba(255,51,102,0.3)', badge: 'badge-critical' },
}

export function getThreatColor(level) {
  return THREAT_COLORS[level] || THREAT_COLORS['SAFE']
}

export function getRiskBarColor(score) {
  if (score >= 80) return 'linear-gradient(90deg, #ff3366, #ff0050)'
  if (score >= 60) return 'linear-gradient(90deg, #ff6b35, #ff3366)'
  if (score >= 40) return 'linear-gradient(90deg, #ffd60a, #ff6b35)'
  if (score >= 20) return 'linear-gradient(90deg, #00d4ff, #ffd60a)'
  return 'linear-gradient(90deg, #00ff88, #00d4ff)'
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function truncate(str, n = 40) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '...' : str
}
