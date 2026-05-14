import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, Mail, Shield, Loader2, AlertTriangle, CheckCircle, Info, ExternalLink, MapPin, Building, Clock } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import ThreatMeter from '../components/ui/ThreatMeter'
import GlowCard from '../components/ui/GlowCard'
import ThreatBadge from '../components/ui/ThreatBadge'
import api from '../api/client'
import { detectInputType, TYPE_LABELS, TYPE_ICONS } from '../utils/inputDetector'
import { getThreatColor } from '../utils/riskScorer'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' })

const BREACH_COLORS = ['#ff3366','#ff6b35','#ffd60a','#00d4ff','#7c3aed','#00ff88']
const TT = { contentStyle:{ background:'#0d1526', border:'1px solid rgba(0,212,255,0.3)', borderRadius:'8px', color:'#e2e8f0', fontSize:'12px' } }

function DetectedTypeBadge({ type }) {
  if (!type || type === 'unknown') return null
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
      {TYPE_ICONS[type]} {TYPE_LABELS[type]} detected
    </span>
  )
}

function IndicatorList({ indicators = [], label = 'Indicators' }) {
  if (!indicators.length) return null
  return (
    <div>
      <p className="text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1.5">
        {indicators.map((ind, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-cyber-text">
            <AlertTriangle size={12} className="text-cyber-orange mt-0.5 flex-shrink-0"/>
            <span>{ind}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecommendationList({ recs = [] }) {
  if (!recs.length) return null
  return (
    <div>
      <p className="text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">Recommendations</p>
      <div className="space-y-1.5">
        {recs.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-cyber-text">
            <CheckCircle size={12} className="text-cyber-green mt-0.5 flex-shrink-0"/>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BreachCard({ breach }) {
  return (
    <GlowCard className="p-4" threat="MEDIUM" animated={false}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-bold text-cyber-text">{breach.Title || breach.Name}</p>
          <p className="text-xs text-cyber-muted">{breach.Domain}</p>
        </div>
        <span className="text-xs text-cyber-muted flex-shrink-0">{breach.BreachDate}</span>
      </div>
      <p className="text-xs text-cyber-muted mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: breach.Description }}/>
      <div className="flex flex-wrap gap-1">
        {(breach.DataClasses || []).slice(0, 4).map((dc, i) => (
          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-cyber-red/10 text-cyber-red border border-cyber-red/20 rounded-full">{dc}</span>
        ))}
        {(breach.DataClasses || []).length > 4 && <span className="text-[10px] text-cyber-muted">+{breach.DataClasses.length - 4} more</span>}
      </div>
      <p className="text-[10px] text-cyber-muted mt-2">{breach.PwnCount?.toLocaleString()} accounts affected</p>
    </GlowCard>
  )
}

export default function ThreatSearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [detectedType, setDetectedType] = useState(null)

  const handleInput = (val) => {
    setQuery(val)
    setDetectedType(val.trim() ? detectInputType(val.trim()) : null)
  }

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/threat/analyze', { query: query.trim() })
      setResult(data)
      toast.success(`Analysis complete — ${data.ai_analysis?.threat_level || 'UNKNOWN'}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [query])

  const ai = result?.ai_analysis || {}
  const geo = result?.geolocation?.data
  const breaches = result?.breaches?.data || []
  const vt = result?.virustotal?.data || {}
  const phish = result?.phishtank?.data?.url_info || {}
  const abuse = result?.abuseipdb?.data || {}

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Bar */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <GlowCard className="p-6">
          <h2 className="text-lg font-bold text-cyber-text mb-1 flex items-center gap-2">
            <Search size={18} className="text-cyber-cyan"/> Universal Threat Search Engine
          </h2>
          <p className="text-xs text-cyber-muted mb-4">Enter a URL, IP address, email, or domain — type is auto-detected</p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                value={query}
                onChange={e => handleInput(e.target.value)}
                placeholder="e.g. 192.168.1.1 · http://phishing.tk · user@example.com · malicious.xyz"
                className="cyber-input font-mono text-sm pr-4"
                autoFocus
              />
              {detectedType && detectedType !== 'unknown' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <DetectedTypeBadge type={detectedType}/>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="cyber-btn flex items-center gap-2 px-6 flex-shrink-0">
              {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-[10px] text-cyber-muted">Try:</span>
            {['8.8.8.8','http://suspicious-login.tk','test@example.com','malware-domain.xyz'].map(ex => (
              <button key={ex} onClick={() => { handleInput(ex); }}
                className="text-[10px] px-2 py-0.5 bg-cyber-border/50 hover:bg-cyber-cyan/10 text-cyber-muted hover:text-cyber-cyan rounded transition-all font-mono">
                {ex}
              </button>
            ))}
          </div>
        </GlowCard>
      </motion.div>

      {/* Loading animation */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="glass-card p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-cyber-cyan/20 animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-cyber-cyan/40 animate-spin"/>
              <div className="absolute inset-4 rounded-full bg-cyber-cyan/20 flex items-center justify-center">
                <Shield size={14} className="text-cyber-cyan"/>
              </div>
            </div>
            <p className="text-sm text-cyber-cyan font-medium typewriter">Scanning threat databases</p>
            <p className="text-xs text-cyber-muted mt-1">Querying VirusTotal · AbuseIPDB · PhishTank · HIBP</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            {/* Summary Bar */}
            <div className="glass-card p-4 flex flex-wrap items-center gap-4 border-l-4" style={{ borderColor: getThreatColor(ai.threat_level)?.text }}>
              <div>
                <p className="text-xs text-cyber-muted">Query</p>
                <p className="text-sm font-mono font-bold text-cyber-text truncate max-w-xs">{result.query}</p>
              </div>
              <div>
                <p className="text-xs text-cyber-muted">Type</p>
                <p className="text-sm font-semibold text-cyber-text capitalize">{TYPE_ICONS[result.query_type]} {TYPE_LABELS[result.query_type]}</p>
              </div>
              <div className="ml-auto">
                <ThreatBadge level={ai.threat_level} size="md"/>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left — Risk meter + indicators */}
              <div className="space-y-4">
                <GlowCard className="p-5" threat={ai.threat_level}>
                  <ThreatMeter score={ai.risk_score||0} level={ai.threat_level||'SAFE'}/>
                </GlowCard>

                {ai.summary && (
                  <GlowCard className="p-4">
                    <p className="text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Info size={11}/> AI Analysis
                    </p>
                    <p className="text-xs text-cyber-text leading-relaxed">{ai.summary}</p>
                  </GlowCard>
                )}

                {ai.indicators?.length > 0 && (
                  <GlowCard className="p-4">
                    <IndicatorList indicators={ai.indicators}/>
                  </GlowCard>
                )}

                {ai.recommendations?.length > 0 && (
                  <GlowCard className="p-4">
                    <RecommendationList recs={ai.recommendations}/>
                  </GlowCard>
                )}
              </div>

              {/* Right — Type-specific results */}
              <div className="lg:col-span-2 space-y-4">
                {/* URL results */}
                {result.query_type === 'url' && (
                  <>
                    <GlowCard className="p-5">
                      <h3 className="text-sm font-bold text-cyber-text mb-3 flex items-center gap-2">
                        <Globe size={14} className="text-cyber-cyan"/> VirusTotal Scan
                      </h3>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="glass-card-light p-3 text-center">
                          <p className="text-2xl font-bold font-mono text-cyber-red">{vt.positives||0}</p>
                          <p className="text-[10px] text-cyber-muted mt-1">Detections</p>
                        </div>
                        <div className="glass-card-light p-3 text-center">
                          <p className="text-2xl font-bold font-mono text-cyber-cyan">{vt.total||72}</p>
                          <p className="text-[10px] text-cyber-muted mt-1">Engines</p>
                        </div>
                        <div className="glass-card-light p-3 text-center">
                          <p className="text-2xl font-bold font-mono text-cyber-green">{vt.total - (vt.positives||0)}</p>
                          <p className="text-[10px] text-cyber-muted mt-1">Clean</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-cyber-muted">Source:</span>
                        <span className={`font-medium ${result.virustotal?.source==='virustotal'?'text-cyber-green':'text-cyber-orange'}`}>
                          {result.virustotal?.source==='virustotal'?'✅ Live VirusTotal API':'⚠️ Demo Data (add API key)'}
                        </span>
                      </div>
                    </GlowCard>

                    <GlowCard className="p-5">
                      <h3 className="text-sm font-bold text-cyber-text mb-3 flex items-center gap-2">
                        🎣 PhishTank Status
                      </h3>
                      <div className={`p-3 rounded-lg text-sm ${phish.in_database?'bg-red-500/10 border border-red-500/20 text-red-400':'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                        {phish.in_database
                          ? `⚠️ LISTED — Verified phishing site (Target: ${phish.target||'Unknown'})`
                          : '✅ NOT in PhishTank database'}
                      </div>
                      <p className="text-xs text-cyber-muted mt-2">Phishing Probability: <span className="font-bold" style={{ color: getThreatColor(ai.threat_level)?.text }}>{Math.round((ai.phishing_probability||0)*100)}%</span></p>
                    </GlowCard>
                  </>
                )}

                {/* IP results */}
                {result.query_type === 'ip' && (
                  <>
                    <GlowCard className="p-5">
                      <h3 className="text-sm font-bold text-cyber-text mb-3 flex items-center gap-2">
                        <Shield size={14} className="text-cyber-cyan"/> AbuseIPDB Report
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {[
                          { label:'Abuse Score', value:`${abuse.abuseConfidenceScore||0}%`, color:'text-cyber-red' },
                          { label:'Total Reports', value:abuse.totalReports||0, color:'text-cyber-orange' },
                          { label:'Country', value:abuse.countryCode||'N/A', color:'text-cyber-cyan' },
                          { label:'ISP', value:(abuse.isp||'Unknown').slice(0,20), color:'text-cyber-text' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="glass-card-light p-3">
                            <p className="text-[10px] text-cyber-muted mb-1">{label}</p>
                            <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                      {abuse.usageType && <p className="text-xs text-cyber-muted">Usage: <span className="text-cyber-text">{abuse.usageType}</span></p>}
                    </GlowCard>

                    {geo && (geo.latitude || geo.loc) && (
                      <GlowCard className="p-5">
                        <h3 className="text-sm font-bold text-cyber-text mb-3 flex items-center gap-2">
                          <MapPin size={14} className="text-cyber-cyan"/> Geolocation
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div><span className="text-cyber-muted">City: </span><span className="text-cyber-text">{geo.city||'N/A'}</span></div>
                          <div><span className="text-cyber-muted">Region: </span><span className="text-cyber-text">{geo.region||'N/A'}</span></div>
                          <div><span className="text-cyber-muted">Country: </span><span className="text-cyber-text">{geo.country_name||geo.country||'N/A'}</span></div>
                          <div><span className="text-cyber-muted">Org: </span><span className="text-cyber-text truncate">{(geo.org||'N/A').slice(0,25)}</span></div>
                        </div>
                        <div className="h-48 rounded-lg overflow-hidden" style={{ zIndex:0 }}>
                          <MapContainer center={[geo.latitude||0, geo.longitude||0]} zoom={5} style={{ height:'100%', width:'100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap"/>
                            <Marker position={[geo.latitude||0, geo.longitude||0]}>
                              <Popup>{result.query}<br/>{geo.city}, {geo.country}</Popup>
                            </Marker>
                            <Circle center={[geo.latitude||0, geo.longitude||0]} radius={50000} color="#ff3366" fillColor="#ff3366" fillOpacity={0.1}/>
                          </MapContainer>
                        </div>
                      </GlowCard>
                    )}
                  </>
                )}

                {/* Email results */}
                {result.query_type === 'email' && (
                  <div className="space-y-3">
                    <GlowCard className="p-5" threat={ai.breach_count > 0 ? 'HIGH' : 'SAFE'}>
                      <h3 className="text-sm font-bold text-cyber-text mb-2 flex items-center gap-2">
                        <Mail size={14} className="text-cyber-cyan"/> HaveIBeenPwned Analysis
                      </h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-4xl font-bold font-mono text-cyber-red">{ai.breach_count||0}</p>
                          <p className="text-xs text-cyber-muted">Breaches Found</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-cyber-text leading-relaxed">{ai.summary}</p>
                        </div>
                      </div>
                    </GlowCard>
                    {breaches.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-cyber-muted uppercase tracking-wider mb-2">Breach Details</p>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {breaches.map((b, i) => <BreachCard key={i} breach={b}/>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Domain results */}
                {result.query_type === 'domain' && (
                  <GlowCard className="p-5">
                    <h3 className="text-sm font-bold text-cyber-text mb-3 flex items-center gap-2">
                      <Building size={14} className="text-cyber-cyan"/> Domain Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label:'Malicious', value:vt.last_analysis_stats?.malicious||vt.positives||0, color:'text-cyber-red' },
                        { label:'Suspicious', value:vt.last_analysis_stats?.suspicious||0, color:'text-cyber-orange' },
                        { label:'Harmless', value:vt.last_analysis_stats?.harmless||60, color:'text-cyber-green' },
                        { label:'Reputation', value:vt.reputation||'N/A', color:'text-cyber-cyan' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="glass-card-light p-3">
                          <p className="text-[10px] text-cyber-muted mb-1">{label}</p>
                          <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !loading && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-cyber-cyan opacity-60"/>
          </div>
          <p className="text-cyber-muted text-sm">Enter any suspicious indicator above to start your investigation</p>
          <div className="flex justify-center gap-6 mt-6 text-xs text-cyber-muted">
            {[['🔗','URLs'],['🌐','IP Addresses'],['📧','Emails'],['🏠','Domains']].map(([icon,label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
