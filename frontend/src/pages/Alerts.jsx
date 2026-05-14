import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import GlowCard from '../components/ui/GlowCard'
import api from '../api/client'
import { formatDate } from '../utils/riskScorer'
import { useAlertStore } from '../store/alertStore'
import toast from 'react-hot-toast'

const ALERT_ICONS = {
  critical: <XCircle size={16} className="text-cyber-red" />,
  danger:   <AlertTriangle size={16} className="text-cyber-orange" />,
  warning:  <AlertTriangle size={16} className="text-yellow-400" />,
  success:  <CheckCircle size={16} className="text-cyber-green" />,
  info:     <Info size={16} className="text-cyber-cyan" />,
}

const ALERT_STYLES = {
  critical: 'border-l-cyber-red bg-cyber-red/5',
  danger:   'border-l-cyber-orange bg-cyber-orange/5',
  warning:  'border-l-yellow-400 bg-yellow-400/5',
  success:  'border-l-cyber-green bg-cyber-green/5',
  info:     'border-l-cyber-cyan bg-cyber-cyan/5',
}

export default function Alerts() {
  const { alerts, setAlerts, markRead: storeMarkRead, markAllRead: storeMarkAllRead, removeAlert } = useAlertStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/alerts/').then(r => setAlerts(r.data.alerts || [])).catch(() => {
      setAlerts([
        { id: '1', title: 'CRITICAL Threat Detected', message: "Investigation of 'http://phishing-login.tk' returned CRITICAL threat level with risk score 95/100.", alert_type: 'critical', query: 'http://phishing-login.tk', is_read: false, created_at: new Date().toISOString() },
        { id: '2', title: 'HIGH Risk IP Found', message: "IP 185.220.101.45 has an abuse confidence score of 87% with 234 reports.", alert_type: 'danger', query: '185.220.101.45', is_read: false, created_at: new Date().toISOString() },
        { id: '3', title: 'Email Breach Detected', message: "Email found in 5 data breaches including LinkedIn and Adobe.", alert_type: 'warning', query: 'user@example.com', is_read: true, created_at: new Date().toISOString() },
        { id: '4', title: 'Analysis Complete', message: "Domain analysis completed successfully. No threats detected.", alert_type: 'success', query: 'google.com', is_read: true, created_at: new Date().toISOString() },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try { await api.post(`/alerts/${id}/read`) } catch {}
    storeMarkRead(id)
  }

  const markAllRead = async () => {
    try { await api.post('/alerts/read-all') } catch {}
    storeMarkAllRead()
    toast.success('All alerts marked as read')
  }

  const deleteAlert = async (id) => {
    try { await api.delete(`/alerts/${id}`) } catch {}
    removeAlert(id)
    toast.success('Alert deleted')
  }

  const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.is_read) : alerts.filter(a => a.alert_type === filter)
  const unreadCount = alerts.filter(a => !a.is_read).length

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
            <Bell size={20} className="text-cyber-cyan" /> Alert Center
            {unreadCount > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 bg-cyber-red/20 text-cyber-red border border-cyber-red/30 rounded-full animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-cyber-muted">{alerts.length} total alerts</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-cyber-cyan hover:underline">
          <CheckCheck size={13} /> Mark all read
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'critical', 'danger', 'warning', 'success'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30' : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5 border border-transparent'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <GlowCard className="p-10 text-center">
            <Bell size={32} className="text-cyber-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm text-cyber-muted">No alerts found</p>
          </GlowCard>
        ) : (
          <AnimatePresence>
            {filtered.map((alert, i) => (
              <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                className={`glass-card p-4 border-l-4 cursor-pointer transition-all ${ALERT_STYLES[alert.alert_type] || ALERT_STYLES.info} ${!alert.is_read ? 'ring-1 ring-cyber-cyan/20' : 'opacity-75'}`}
                onClick={() => !alert.is_read && markRead(alert.id)}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{ALERT_ICONS[alert.alert_type] || ALERT_ICONS.info}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${alert.is_read ? 'text-cyber-muted' : 'text-cyber-text'}`}>{alert.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.is_read && <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />}
                        <button onClick={e => { e.stopPropagation(); deleteAlert(alert.id) }}
                          className="text-cyber-muted hover:text-cyber-red transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <p className="text-xs text-cyber-muted mt-1">{alert.message}</p>
                    {alert.query && <p className="text-[10px] font-mono text-cyber-cyan/70 mt-1">{alert.query}</p>}
                    <p className="text-[10px] text-cyber-muted mt-1.5">{formatDate(alert.created_at)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
