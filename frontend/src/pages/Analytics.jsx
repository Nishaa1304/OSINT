import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart as PieIcon, Download } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import GlowCard from '../components/ui/GlowCard'
import api from '../api/client'

const TT = { contentStyle: { background: '#0d1526', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' } }
const THREAT_COLORS = { SAFE: '#00ff88', LOW: '#00d4ff', MEDIUM: '#ffd60a', HIGH: '#ff6b35', CRITICAL: '#ff3366' }
const TYPE_COLORS = ['#00d4ff', '#7c3aed', '#00ff88', '#ffd60a', '#ff6b35']

const DEMO_MONTHLY = [
  { month: 'Jan', searches: 42, threats: 12 }, { month: 'Feb', searches: 58, threats: 18 },
  { month: 'Mar', searches: 71, threats: 23 }, { month: 'Apr', searches: 65, threats: 19 },
  { month: 'May', searches: 89, threats: 34 }, { month: 'Jun', searches: 94, threats: 28 },
  { month: 'Jul', searches: 110, threats: 41 }, { month: 'Aug', searches: 98, threats: 36 },
  { month: 'Sep', searches: 125, threats: 48 }, { month: 'Oct', searches: 143, threats: 52 },
  { month: 'Nov', searches: 138, threats: 49 }, { month: 'Dec', searches: 162, threats: 61 },
]

const DEMO_COUNTRIES = [
  { country: 'Russia', count: 87, flag: '🇷🇺' }, { country: 'China', count: 73, flag: '🇨🇳' },
  { country: 'North Korea', count: 45, flag: '🇰🇵' }, { country: 'Iran', count: 38, flag: '🇮🇷' },
  { country: 'Brazil', count: 29, flag: '🇧🇷' }, { country: 'Ukraine', count: 24, flag: '🇺🇦' },
]

const DEMO_LEVEL_PIE = [
  { name: 'SAFE', value: 45 }, { name: 'LOW', value: 30 },
  { name: 'MEDIUM', value: 15 }, { name: 'HIGH', value: 7 }, { name: 'CRITICAL', value: 3 },
]

const DEMO_TYPE_PIE = [
  { name: 'URL', value: 38 }, { name: 'IP', value: 29 },
  { name: 'Email', value: 18 }, { name: 'Domain', value: 15 },
]

export default function Analytics() {
  const [range, setRange] = useState('month')
  const [loading, setLoading] = useState(false)
  const up = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4 } })

  return (
    <div className="space-y-6">
      <motion.div {...up()} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
            <BarChart3 size={20} className="text-cyber-cyan" /> Analytics Center
          </h2>
          <p className="text-sm text-cyber-muted mt-0.5">Advanced threat intelligence metrics and visualizations</p>
        </div>
        <div className="flex items-center gap-2">
          {['week', 'month', 'year'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30' : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Monthly trend */}
      <motion.div {...up(0.1)} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-cyber-text flex items-center gap-2">
            <TrendingUp size={15} className="text-cyber-cyan" /> Monthly Search & Threat Trends
          </h3>
          <button className="flex items-center gap-1 text-xs text-cyber-muted hover:text-cyber-cyan transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={DEMO_MONTHLY}>
            <defs>
              <linearGradient id="gSearch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gThreat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
            <Area type="monotone" dataKey="searches" stroke="#00d4ff" fill="url(#gSearch)" strokeWidth={2} dot={false} name="Total Searches" />
            <Area type="monotone" dataKey="threats" stroke="#ff3366" fill="url(#gThreat)" strokeWidth={2} dot={false} name="Threats Detected" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div {...up(0.15)} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
            <PieIcon size={15} className="text-cyber-cyan" /> Threat Level Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={DEMO_LEVEL_PIE} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {DEMO_LEVEL_PIE.map((e, i) => <Cell key={i} fill={THREAT_COLORS[e.name]} stroke="none" />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {DEMO_LEVEL_PIE.map(d => (
              <div key={d.name} className="flex items-center gap-1 text-xs text-cyber-muted">
                <div className="w-2 h-2 rounded-full" style={{ background: THREAT_COLORS[d.name] }} />
                {d.name}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...up(0.2)} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-cyber-text mb-4 flex items-center gap-2">
            <PieIcon size={15} className="text-cyber-cyan" /> Query Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={DEMO_TYPE_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {DEMO_TYPE_PIE.map((e, i) => <Cell key={i} fill={TYPE_COLORS[i]} stroke="none" />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {DEMO_TYPE_PIE.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1 text-xs text-cyber-muted">
                <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[i] }} />
                {d.name}: {d.value}%
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top malicious countries */}
      <motion.div {...up(0.25)} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-cyber-text mb-4">🌍 Top Threat Origin Countries</h3>
        <div className="space-y-3">
          {DEMO_COUNTRIES.map((c, i) => (
            <div key={c.country} className="flex items-center gap-3">
              <span className="text-lg">{c.flag}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cyber-text font-medium">{c.country}</span>
                  <span className="text-cyber-red font-mono">{c.count} threats</span>
                </div>
                <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #ff3366, #ff6b35)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / DEMO_COUNTRIES[0].count) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar chart */}
      <motion.div {...up(0.3)} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-cyber-text mb-4">📊 Quarterly Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DEMO_MONTHLY.slice(0, 4).map((m, i) => ({ ...m, q: `Q${i + 1}` }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="searches" fill="#00d4ff" radius={[4, 4, 0, 0]} name="Searches" />
            <Bar dataKey="threats" fill="#ff3366" radius={[4, 4, 0, 0]} name="Threats" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
