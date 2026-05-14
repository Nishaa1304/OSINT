import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, Search, User, ChevronDown, LogOut, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/client'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/search':    'Threat Search Engine',
  '/analytics': 'Analytics Center',
  '/history':   'Investigation History',
  '/alerts':    'Alert Center',
  '/reports':   'Report Generator',
  '/assistant': 'AI Assistant',
  '/settings':  'Settings',
}

export default function Navbar({ onToggleSidebar, onMobileMenu }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const [time, setTime] = useState(new Date())

  const title = PAGE_TITLES[location.pathname] || 'OSINT Dashboard'

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    api.get('/analytics/summary').then(r => {
      setAlertCount(r.data?.unread_alerts || 0)
    }).catch(() => {})
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-cyber-surface border-b border-cyber-border flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="lg:hidden text-cyber-muted hover:text-cyber-text transition-colors p-1"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex text-cyber-muted hover:text-cyber-text transition-colors p-1"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-cyber-text">{title}</h1>
          <div className="text-[10px] text-cyber-muted font-mono">
            {time.toLocaleTimeString('en-IN')} IST
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Quick search */}
        <button
          onClick={() => navigate('/search')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cyber-bg rounded-lg border border-cyber-border text-cyber-muted text-xs hover:border-cyber-cyan/40 transition-all"
        >
          <Search size={13} />
          <span>Quick search...</span>
          <kbd className="ml-1 text-[10px] px-1 bg-cyber-border rounded">⌘K</kbd>
        </button>

        {/* Alerts bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 text-cyber-muted hover:text-cyber-cyan transition-colors"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyber-red rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-xs text-cyber-text font-medium">{user?.username}</span>
            <ChevronDown size={13} className="hidden md:block text-cyber-muted" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-48 glass-card border border-cyber-border rounded-xl shadow-card z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-cyber-border">
                  <div className="text-sm font-semibold text-cyber-text">{user?.username}</div>
                  <div className="text-xs text-cyber-muted">{user?.email}</div>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full badge-low capitalize">{user?.role}</span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings') }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cyber-muted hover:text-cyber-text hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Settings size={13} /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cyber-red hover:bg-cyber-red/10 rounded-lg transition-all"
                  >
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
