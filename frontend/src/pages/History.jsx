import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History as HistoryIcon, Search, Trash2, Bookmark, BookmarkCheck, RefreshCw } from 'lucide-react'
import ThreatBadge from '../components/ui/ThreatBadge'
import GlowCard from '../components/ui/GlowCard'
import { SkeletonTable } from '../components/ui/LoadingSkeleton'
import api from '../api/client'
import { formatDate, truncate } from '../utils/riskScorer'
import { TYPE_ICONS, TYPE_LABELS } from '../utils/inputDetector'
import { useHistoryStore } from '../store/historyStore'
import toast from 'react-hot-toast'

const QUERY_TYPES = ['all','url','ip','email','domain']
const THREAT_LEVELS = ['all','SAFE','LOW','MEDIUM','HIGH','CRITICAL']

export default function History() {
  const { items, total, page, pages, setHistory, setPage, removeItem, toggleBookmark } = useHistoryStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (typeFilter !== 'all') params.set('query_type', typeFilter)
      if (levelFilter !== 'all') params.set('threat_level', levelFilter)
      if (search) params.set('search', search)
      const { data } = await api.get(`/history/?${params}`)
      setHistory({ items: data.items || [], total: data.total || 0, pages: data.pages || 1 })
    } catch { toast.error('Could not load history') }
    finally { setLoading(false) }
  }, [page, typeFilter, levelFilter, search])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleDelete = async (id) => {
    try { await api.delete(`/history/${id}`); removeItem(id); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const handleBookmark = async (id) => {
    try {
      const { data } = await api.post(`/history/${id}/bookmark`)
      toggleBookmark(id, data.is_bookmarked)
      toast.success(data.is_bookmarked ? 'Bookmarked!' : 'Removed')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2"><HistoryIcon size={20} className="text-cyber-cyan"/> Investigation History</h2>
          <p className="text-sm text-cyber-muted">{total} total investigations recorded</p>
        </div>
        <button onClick={fetchHistory} className="flex items-center gap-1.5 text-xs text-cyber-muted hover:text-cyber-cyan transition-colors">
          <RefreshCw size={13}/> Refresh
        </button>
      </motion.div>

      <GlowCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted"/>
            <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }} placeholder="Search queries..." className="cyber-input pl-8 text-sm"/>
          </div>
          <select value={typeFilter} onChange={e=>{ setTypeFilter(e.target.value); setPage(1) }} className="cyber-input text-sm w-auto">
            {QUERY_TYPES.map(t => <option key={t} value={t}>{t==='all'?'All Types':TYPE_LABELS[t]}</option>)}
          </select>
          <select value={levelFilter} onChange={e=>{ setLevelFilter(e.target.value); setPage(1) }} className="cyber-input text-sm w-auto">
            {THREAT_LEVELS.map(l => <option key={l} value={l}>{l==='all'?'All Levels':l}</option>)}
          </select>
        </div>
      </GlowCard>

      {loading ? <SkeletonTable rows={8}/> : (
        <GlowCard className="overflow-hidden">
          {items.length === 0 ? (
            <div className="p-10 text-center text-cyber-muted text-sm">No records found. Start investigating in Threat Search.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      {['Type','Query','Threat Level','Risk','Date','Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-cyber-muted font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/50">
                    {items.map((item, i) => (
                      <motion.tr key={item.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
                        className="hover:bg-white/3 transition-colors group">
                        <td className="py-3 px-4 text-base">{TYPE_ICONS[item.query_type]}</td>
                        <td className="py-3 px-4"><span className="font-mono text-cyber-text">{truncate(item.query, 35)}</span></td>
                        <td className="py-3 px-4"><ThreatBadge level={item.threat_level} size="xs"/></td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold" style={{ color: item.risk_score>=60?'#ff3366':item.risk_score>=40?'#ffd60a':'#00ff88' }}>
                            {item.risk_score??'—'}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">{formatDate(item.created_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleBookmark(item.id)} className={item.is_bookmarked?'text-yellow-400':'text-cyber-muted hover:text-yellow-400 transition-colors'}>
                              {item.is_bookmarked ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-cyber-muted hover:text-cyber-red transition-colors">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-cyber-border">
                  <p className="text-xs text-cyber-muted">Page {page} of {pages}</p>
                  <div className="flex gap-2">
            <button disabled={page<=1} onClick={() => setPage(page-1)} className="px-3 py-1.5 text-xs rounded-lg border border-cyber-border text-cyber-muted hover:text-cyber-cyan disabled:opacity-40 transition-all">Prev</button>
                    <button disabled={page>=pages} onClick={() => setPage(page+1)} className="px-3 py-1.5 text-xs rounded-lg border border-cyber-border text-cyber-muted hover:text-cyber-cyan disabled:opacity-40 transition-all">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </GlowCard>
      )}
    </div>
  )
}
