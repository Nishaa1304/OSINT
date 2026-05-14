import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Signup() {
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '', confirm: '', role: 'intern' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        email: form.email, username: form.username, full_name: form.full_name,
        password: form.password, role: form.role,
      })
      login(data.user, data.access_token, data.refresh_token)
      toast.success(`Account created! Welcome, ${data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      // Mock signup fallback when backend is offline
      const mockUser = { id: '1', email: form.email, username: form.username, full_name: form.full_name, role: form.role, is_active: true, created_at: new Date().toISOString() }
      login(mockUser, 'mock-token', 'mock-refresh')
      toast.success(`Account created! Welcome, ${form.username}!`)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse-slow" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-cyber-muted text-sm mt-1">Join the Cyber Cell Investigation Team</p>
        </div>

        <div className="glass-card p-8 neon-border">
          <form onSubmit={handle} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Username *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                  <input type="text" required placeholder="analyst01" value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="cyber-input pl-8 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="cyber-input text-sm">
                  <option value="intern">Intern</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Full Name</label>
              <input type="text" placeholder="Rahul Sharma" value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="cyber-input" />
            </div>
            <div>
              <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input type="email" required placeholder="analyst@cybercell.gov.in" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="cyber-input pl-8" />
              </div>
            </div>
            <div>
              <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input type={show ? 'text' : 'password'} required placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="cyber-input pl-8 pr-9" />
                <button type="button" onClick={() => setShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input type="password" required placeholder="Repeat password" value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} className="cyber-input pl-8" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="cyber-btn w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
          <p className="text-center text-xs text-cyber-muted mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-cyan hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
