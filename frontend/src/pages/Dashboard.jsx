import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, Globe, Mail, AlertTriangle, Activity, TrendingUp, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import StatCard from '../components/ui/StatCard'
import GlowCard from '../components/ui/GlowCard'
import ThreatBadge from '../components/ui/ThreatBadge'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import api from '../api/client'
import { formatDate } from '../utils/riskScorer'
import { useAuthStore } from '../store/authStore'

const THREAT_COLORS = { SAFE:'#00ff88', LOW:'#00d4ff', MEDIUM:'#ffd60a', HIGH:'#ff6b35', CRITICAL:'#ff3366' }
const TYPE_COLORS = ['#00d4ff','#7c3aed','#00ff88','#ffd60a','#ff6b35']

const DEMO_TRENDS = [
  { date:'May 1', SAFE:4, LOW:3, MEDIUM:2, HIGH:1, CRITICAL:0 },
  { date:'May 2', SAFE:6, LOW:4, MEDIUM:3, HIGH:2, CRITICAL:1 },
  { date:'May 3', SAFE:3, LOW:5, MEDIUM:4, HIGH:3, CRITICAL:1 },
  { date:'May 4', SAFE:8, LOW:2, MEDIUM:2, HIGH:1, CRITICAL:0 },
  { date:'May 5', SAFE:5, LOW:6, MEDIUM:5, HIGH:4, CRITICAL:2 },
  { date:'May 6', SAFE:7, LOW:3, MEDIUM:3, HIGH:2, CRITICAL:1 },
  { date:'May 7', SAFE:9, LOW:4, MEDIUM:2, HIGH:1, CRITICAL:0 },
]

const DEMO_STATS = { total_searches:247, critical_threats:12, high_threats:34, phishing_urls:28, suspicious_ips:56, breached_emails:19, unread_alerts:5 }
const DEMO_PIE = [{ name:'SAFE',value:45 },{ name:'LOW',value:30 },{ name:'MEDIUM',value:15 },{ name:'HIGH',value:7 },{ name:'CRITICAL',value:3 }]
const DEMO_BAR = [{ name:'URL',count:98 },{ name:'IP',count:76 },{ name:'EMAIL',count:43 },{ name:'DOMAIN',count:30 }]

const TT = { contentStyle:{ background:'#0d1526', border:'1px solid rgba(0,212,255,0.3)', borderRadius:'8px', color:'#e2e8f0', fontSize:'12px' } }

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [levelPie, setLevelPie] = useState(DEMO_PIE)
  const [typeBar, setTypeBar] = useState(DEMO_BAR)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary').catch(() => null),
      api.get('/analytics/recent-activity?limit=8').catch(() => null),
      api.get('/analytics/distribution').catch(() => null),
    ]).then(([s, a, d]) => {
      setStats(s?.data || DEMO_STATS)
      setActivity(a?.data?.activity || [])
      if (d?.data?.level_distribution?.length) setLevelPie(d.data.level_distribution.map(x => ({ name: x._id||'UNKNOWN', value: x.count })))
      if (d?.data?.type_distribution?.length)  setTypeBar(d.data.type_distribution.map(x => ({ name: (x._id||'unknown').toUpperCase(), count: x.count })))
    }).finally(() => setLoading(false))
  }, [])

  const up = (delay=0) => ({ initial:{ opacity:0, y:20 }, animate:{ opacity:1, y:0 }, transition:{ duration:0.4, delay } })

  return (
    <div className="space-y-6">
      <motion.div {...up()} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-cyber-text">Welcome back, <span className="gradient-text">{user?.username}</span> 👋</h2>
          <p className="text-sm text-cyber-muted mt-0.5">Cyber Threat Intelligence Overview</p>
        </div>
        <button onClick={() => navigate('/search')} className="cyber-btn flex items-center gap-2 text-sm">
          <Search size={15}/> New Investigation
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div {...up(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Searches"   value={stats ? <AnimatedCounter target={stats.total_searches}   /> : '—'} icon={Activity}      color="cyan"   loading={loading}/>
        <StatCard title="Critical Threats" value={stats ? <AnimatedCounter target={stats.critical_threats} /> : '—'} icon={AlertTriangle} color="red"    loading={loading}/>
        <StatCard title="Phishing URLs"    value={stats ? <AnimatedCounter target={stats.phishing_urls}    /> : '—'} icon={Globe}         color="orange" loading={loading}/>
        <StatCard title="Suspicious IPs"   value={stats ? <AnimatedCounter target={stats.suspicious_ips}   /> : '—'} icon={Shield}        color="blue"   loading={loading}/>
        <StatCard title="Breached Emails"  value={stats ? <AnimatedCounter target={stats.breached_emails}  /> : '—'} icon={Mail}          color="yellow" loading={loading}/>
        <StatCard title="High Threats"     value={stats ? <AnimatedCounter target={stats.high_threats}     /> : '—'} icon={TrendingUp}    color="orange" loading={loading}/>
        <StatCard title="Unread Alerts"    value={stats ? <AnimatedCounter target={stats.unread_alerts}    /> : '—'} icon={AlertTriangle} color="yellow" loading={loading} subtitle="Needs attention"/>
        <GlowCard className="p-5 flex flex-col justify-between">
          <p className="text-xs text-cyber-muted font-medium uppercase tracking-wider">Quick Action</p>
          <button onClick={() => navigate('/search')} className="mt-3 w-full py-2 rounded-lg border border-cyber-cyan/30 text-cyber-cyan text-xs font-medium hover:bg-cyber-cyan/10 transition-all flex items-center justify-center gap-2">
            <Search size={13}/> Start Investigation
          </button>
        </GlowCard>
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...up(0.2)} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-cyber-cyan"/> Threat Trends — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={DEMO_TRENDS}>
              <defs>
                {Object.entries(THREAT_COLORS).map(([k,v]) => (
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={v} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={v} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)"/>
              <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip {...TT}/>
              {['CRITICAL','HIGH','MEDIUM','LOW','SAFE'].map(l => (
                <Area key={l} type="monotone" dataKey={l} stroke={THREAT_COLORS[l]} fill={`url(#g-${l})`} strokeWidth={2} dot={false}/>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...up(0.25)} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
            <Shield size={15} className="text-cyber-cyan"/> Threat Distribution
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={levelPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {levelPie.map((e,i) => <Cell key={i} fill={THREAT_COLORS[e.name]||'#64748b'} stroke="none"/>)}
              </Pie>
              <Tooltip {...TT}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {levelPie.map((d,i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-cyber-muted">
                <div className="w-2 h-2 rounded-full" style={{ background: THREAT_COLORS[d.name]||'#64748b' }}/>
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...up(0.3)} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
            <Activity size={15} className="text-cyber-cyan"/> Search Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={typeBar} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip {...TT}/>
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {typeBar.map((_,i) => <Cell key={i} fill={TYPE_COLORS[i%TYPE_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...up(0.35)} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-cyber-text flex items-center gap-2">
              <Clock size={15} className="text-cyber-cyan"/> Recent Investigations
            </h3>
            <button onClick={() => navigate('/history')} className="text-xs text-cyber-cyan hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {activity.length === 0 ? (
              <div className="text-center py-8 text-cyber-muted text-xs">
                No investigations yet.{' '}
                <button onClick={() => navigate('/search')} className="text-cyber-cyan hover:underline">Start one →</button>
              </div>
            ) : activity.map((item, i) => (
              <motion.div key={item.id||i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => navigate('/history')}>
                <span className="text-base flex-shrink-0">
                  {item.query_type==='ip'?'🌐':item.query_type==='email'?'📧':item.query_type==='url'?'🔗':'🏠'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-cyber-text truncate">{item.query}</p>
                  <p className="text-[10px] text-cyber-muted">{formatDate(item.created_at)}</p>
                </div>
                <ThreatBadge level={item.threat_level} size="xs"/>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
