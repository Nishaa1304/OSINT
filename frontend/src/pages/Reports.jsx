import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, RefreshCw, Eye } from 'lucide-react'
import GlowCard from '../components/ui/GlowCard'
import ThreatBadge from '../components/ui/ThreatBadge'
import { SkeletonTable } from '../components/ui/LoadingSkeleton'
import api from '../api/client'
import { formatDate, truncate } from '../utils/riskScorer'
import { TYPE_ICONS } from '../utils/inputDetector'
import toast from 'react-hot-toast'

export default function Reports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    api.get('/history/?limit=20').then(r => setItems(r.data.items || [])).catch(() => {
      setItems([
        { id: 'demo1', query: 'http://phishing-login.tk', query_type: 'url', threat_level: 'CRITICAL', risk_score: 95, created_at: new Date().toISOString() },
        { id: 'demo2', query: '185.220.101.45', query_type: 'ip', threat_level: 'HIGH', risk_score: 78, created_at: new Date().toISOString() },
        { id: 'demo3', query: 'victim@email.com', query_type: 'email', threat_level: 'MEDIUM', risk_score: 55, created_at: new Date().toISOString() },
      ])
    }).finally(() => setLoading(false))
  }, [])

  const downloadReport = async (id, query) => {
    setGenerating(id)
    try {
      const resp = await api.get(`/reports/generate/${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `threat_report_${query.replace(/[^a-z0-9]/gi, '_').slice(0, 20)}_${Date.now()}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch {
      toast.error('Report generation requires live backend connection')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
            <FileText size={20} className="text-cyber-cyan" /> Report Generator
          </h2>
          <p className="text-sm text-cyber-muted">Generate PDF intelligence reports from your investigations</p>
        </div>
      </motion.div>

      {/* Info card */}
      <GlowCard className="p-4 border border-cyber-cyan/20">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-cyber-cyan mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-cyber-text">PDF Intelligence Reports</p>
            <p className="text-xs text-cyber-muted mt-1">
              Generate professional threat intelligence PDF reports for any completed investigation.
              Reports include threat summary, risk score, AI analysis, indicators, and recommendations — formatted for government use.
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Table of investigations */}
      {loading ? <SkeletonTable rows={5} /> : (
        <GlowCard className="overflow-hidden">
          <div className="p-4 border-b border-cyber-border">
            <h3 className="text-sm font-semibold text-cyber-text">Available Investigation Reports ({items.length})</h3>
          </div>
          {items.length === 0 ? (
            <div className="p-10 text-center text-cyber-muted text-sm">
              No investigations found. Run a threat search first to generate reports.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-cyber-border">
                    {['Type', 'Query', 'Threat Level', 'Risk Score', 'Date', 'Report'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-cyber-muted font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/50">
                  {items.map((item, i) => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/3 transition-colors">
                      <td className="py-3 px-4 text-base">{TYPE_ICONS[item.query_type]}</td>
                      <td className="py-3 px-4"><span className="font-mono text-cyber-text">{truncate(item.query, 35)}</span></td>
                      <td className="py-3 px-4"><ThreatBadge level={item.threat_level} size="xs" /></td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold" style={{ color: item.risk_score >= 60 ? '#ff3366' : item.risk_score >= 40 ? '#ffd60a' : '#00ff88' }}>
                          {item.risk_score ?? '—'}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => downloadReport(item.id, item.query)}
                          disabled={generating === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 hover:bg-cyber-cyan/20 transition-all text-[11px] font-medium disabled:opacity-50"
                        >
                          {generating === item.id
                            ? <><RefreshCw size={11} className="animate-spin" /> Generating...</>
                            : <><Download size={11} /> PDF Report</>
                          }
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlowCard>
      )}
    </div>
  )
}
