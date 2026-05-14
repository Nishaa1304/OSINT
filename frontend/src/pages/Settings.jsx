import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, Key, Bell, Palette, Save, Eye, EyeOff, Shield, Lock } from 'lucide-react'
import GlowCard from '../components/ui/GlowCard'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User  },
  { id: 'api',           label: 'API Keys',       icon: Key   },
  { id: 'notifications', label: 'Notifications',  icon: Bell  },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
]

function Section({ title, children }) {
  return (
    <GlowCard className="p-5 space-y-4">
      <h3 className="text-sm font-semibold text-cyber-text border-b border-cyber-border pb-3">{title}</h3>
      {children}
    </GlowCard>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-cyber-muted uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-cyber-muted mt-1">{hint}</p>}
    </div>
  )
}

function ApiKeyField({ label, envKey, placeholder }) {
  const [show, setShow] = useState(false)
  const [val, setVal] = useState('')
  return (
    <Field label={label} hint={`Set via .env: ${envKey}`}>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={val} onChange={e => setVal(e.target.value)}
          placeholder={placeholder || 'Enter API key...'} className="cyber-input pr-10 font-mono text-sm"/>
        <button type="button" onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text">
          {show ? <EyeOff size={14}/> : <Eye size={14}/>}
        </button>
      </div>
    </Field>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ username: user?.username || '', full_name: user?.full_name || '', email: user?.email || '' })
  const [notifs, setNotifs] = useState({ critical: true, high: true, medium: false, email_alerts: false })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const saveProfile = () => {
    updateUser({ username: profile.username, full_name: profile.full_name })
    toast.success('Profile updated!')
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.new_password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setPwLoading(true)
    try {
      await api.post('/auth/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password })
      toast.success('Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
          <SettingsIcon size={20} className="text-cyber-cyan"/> Settings
        </h2>
        <p className="text-sm text-cyber-muted">Manage your account, API keys, and preferences</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              tab === id ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30' : 'text-cyber-muted hover:text-cyber-text'
            }`}>
            <Icon size={13}/> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} className="space-y-4">
          <Section title="👤 Profile Information">
            <div className="flex items-center gap-4 pb-4 border-b border-cyber-border">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center text-white text-xl font-bold glow-cyan">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-cyber-text">{profile.username}</p>
                <p className="text-xs text-cyber-muted capitalize">{user?.role} · {profile.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] mt-1 px-2 py-0.5 rounded-full bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
                  <Shield size={9}/> Active
                </span>
              </div>
            </div>
            <Field label="Username">
              <input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} className="cyber-input"/>
            </Field>
            <Field label="Full Name">
              <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className="cyber-input"/>
            </Field>
            <Field label="Email">
              <input value={profile.email} disabled className="cyber-input opacity-60 cursor-not-allowed"/>
            </Field>
            <button onClick={saveProfile} className="cyber-btn flex items-center gap-2 text-sm">
              <Save size={14}/> Save Profile
            </button>
          </Section>

          <Section title="🔒 Change Password">
            <form onSubmit={changePassword} className="space-y-3">
              <Field label="Current Password">
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted"/>
                  <input type="password" value={pwForm.current_password} onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                    placeholder="Current password" className="cyber-input pl-8"/>
                </div>
              </Field>
              <Field label="New Password">
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted"/>
                  <input type="password" value={pwForm.new_password} onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                    placeholder="Min 6 characters" className="cyber-input pl-8"/>
                </div>
              </Field>
              <Field label="Confirm New Password">
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted"/>
                  <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repeat new password" className="cyber-input pl-8"/>
                </div>
              </Field>
              <button type="submit" disabled={pwLoading} className="cyber-btn flex items-center gap-2 text-sm">
                {pwLoading ? 'Saving...' : <><Lock size={14}/> Change Password</>}
              </button>
            </form>
          </Section>
        </motion.div>
      )}

      {/* API Keys */}
      {tab === 'api' && (
        <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} className="space-y-4">
          <Section title="🔑 API Key Configuration">
            <p className="text-xs text-cyber-muted bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-lg p-3">
              API keys are configured via the backend <code className="text-cyber-cyan">.env</code> file for security.
              The values below are for reference only — set them in <code className="text-cyber-cyan">backend/.env</code>.
            </p>
            <ApiKeyField label="VirusTotal API Key"      envKey="VIRUSTOTAL_API_KEY"  placeholder="vt-api-key-here"/>
            <ApiKeyField label="AbuseIPDB API Key"       envKey="ABUSEIPDB_API_KEY"   placeholder="abuseipdb-key-here"/>
            <ApiKeyField label="IPInfo Token"             envKey="IPINFO_TOKEN"        placeholder="ipinfo-token-here"/>
            <ApiKeyField label="PhishTank App Key"        envKey="PHISHTANK_APP_KEY"   placeholder="phishtank-key-here"/>
            <ApiKeyField label="HaveIBeenPwned API Key"   envKey="HIBP_API_KEY"        placeholder="hibp-key-here"/>
          </Section>
        </motion.div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}>
          <Section title="🔔 Alert Preferences">
            {[
              { key: 'critical', label: 'Critical Threats', desc: 'Alert when risk score ≥ 80' },
              { key: 'high',     label: 'High Threats',     desc: 'Alert when risk score ≥ 60' },
              { key: 'medium',   label: 'Medium Threats',   desc: 'Alert when risk score ≥ 40' },
              { key: 'email_alerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/3 transition-all">
                <div>
                  <p className="text-sm text-cyber-text font-medium">{label}</p>
                  <p className="text-xs text-cyber-muted">{desc}</p>
                </div>
                <button onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${notifs[key] ? 'bg-cyber-cyan' : 'bg-cyber-border'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifs[key] ? 'left-6' : 'left-1'}`}/>
                </button>
              </div>
            ))}
            <button onClick={() => toast.success('Notification settings saved!')} className="cyber-btn flex items-center gap-2 text-sm">
              <Save size={14}/> Save Settings
            </button>
          </Section>
        </motion.div>
      )}

      {/* Appearance */}
      {tab === 'appearance' && (
        <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}>
          <Section title="🎨 Appearance">
            <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 text-xs text-cyber-muted">
              The dashboard uses a dark cyber intelligence theme by default. This is the recommended mode for extended investigations.
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Dark Cyber', desc: 'Default — Dark navy with cyan accents', active: true, bg: 'from-slate-900 to-blue-950' },
                { name: 'Dark Midnight', desc: 'Pure black with purple accents', active: false, bg: 'from-black to-purple-950' },
              ].map(theme => (
                <div key={theme.name} className={`p-4 rounded-xl border cursor-pointer transition-all ${theme.active ? 'border-cyber-cyan glow-cyan' : 'border-cyber-border hover:border-cyber-cyan/30'}`}>
                  <div className={`h-12 rounded-lg bg-gradient-to-br ${theme.bg} mb-3`}/>
                  <p className="text-xs font-semibold text-cyber-text">{theme.name}</p>
                  <p className="text-[10px] text-cyber-muted mt-0.5">{theme.desc}</p>
                  {theme.active && <p className="text-[10px] text-cyber-cyan mt-1">✓ Active</p>}
                </div>
              ))}
            </div>
          </Section>
        </motion.div>
      )}
    </div>
  )
}
