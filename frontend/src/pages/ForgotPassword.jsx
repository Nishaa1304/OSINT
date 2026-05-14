import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSubmitted(true)
      toast.success('Request submitted!')
    } catch {
      // Still show success for security (don't reveal if email exists)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Reset Password</h1>
          <p className="text-cyber-muted text-sm mt-1">Submit a reset request to your administrator</p>
        </div>

        <div className="glass-card p-8 neon-border">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center mx-auto">
                <CheckCircle size={20} className="text-cyber-green" />
              </div>
              <p className="text-sm text-cyber-text font-medium">Request Submitted</p>
              <p className="text-xs text-cyber-muted">
                If this email is registered, your administrator has been notified.
                Contact <span className="text-cyber-cyan">admin@cybercell.gov.in</span> with your employee ID.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:underline mt-2">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handle} className="space-y-4">
              <div>
                <label className="text-xs text-cyber-muted font-medium mb-1.5 block uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                  <input
                    type="email"
                    required
                    placeholder="analyst@cybercell.gov.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="cyber-input pl-9"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="cyber-btn w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {loading ? 'Submitting...' : 'Submit Reset Request'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-xs text-cyber-muted hover:text-cyber-cyan transition-colors mt-2">
                <ArrowLeft size={13} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
