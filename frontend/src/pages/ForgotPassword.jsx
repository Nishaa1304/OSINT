import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-cyber-bg grid-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Reset Password</h1>
          <p className="text-cyber-muted text-sm mt-1">Contact your system administrator to reset your password</p>
        </div>
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center mx-auto">
            <Mail size={20} className="text-cyber-cyan" />
          </div>
          <p className="text-sm text-cyber-muted">
            For security reasons, password resets must be performed by your Cyber Cell administrator. 
            Please contact <span className="text-cyber-cyan">admin@cybercell.gov.in</span> with your employee ID.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:underline mt-4">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
