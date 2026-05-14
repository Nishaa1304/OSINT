import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.access_token, data.refresh_token)
      toast.success(`Welcome back, ${data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(0,212,255,0.3)', '0 0 40px rgba(0,212,255,0.6)', '0 0 20px rgba(0,212,255,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center mx-auto mb-4"
          >
            <Shield size={28} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">OSINT Intel Dashboard</h1>
          <p className="text-cyber-muted text-sm mt-1">Government Cyber Cell — Secure Access</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 neon-border">
          <h2 className="text-lg font-semibold text-cyber-text mb-6">Sign In</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input
                  type="email"
                  required
                  placeholder="analyst@cybercell.gov.in"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="cyber-input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="cyber-input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-cyber-cyan hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="cyber-btn w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
          <p className="text-center text-xs text-cyber-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyber-cyan hover:underline font-medium">Register here</Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-cyber-muted mt-4">
          🔒 Secure · Encrypted · Government Grade
        </p>
      </motion.div>
    </div>
  )
}
