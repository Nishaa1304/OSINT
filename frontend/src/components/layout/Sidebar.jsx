import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, BarChart3, History,
  Bell, FileText, Bot, Settings, Shield, LogOut, ChevronRight, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   group: 'main' },
  { to: '/search',     icon: Search,          label: 'Threat Search',group: 'main' },
  { to: '/analytics',  icon: BarChart3,       label: 'Analytics',   group: 'main' },
  { to: '/history',    icon: History,         label: 'History',     group: 'main' },
  { to: '/alerts',     icon: Bell,            label: 'Alerts',      group: 'tools' },
  { to: '/reports',    icon: FileText,        label: 'Reports',     group: 'tools' },
  { to: '/assistant',  icon: Bot,             label: 'AI Assistant',group: 'tools' },
  { to: '/settings',   icon: Settings,        label: 'Settings',    group: 'system' },
]

export default function Sidebar({ open, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-cyber-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center flex-shrink-0 glow-cyan">
            <Shield size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="text-xs font-bold gradient-text leading-tight whitespace-nowrap">OSINT INTEL</div>
                <div className="text-[10px] text-cyber-muted whitespace-nowrap">Cyber Cell Dashboard</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {['main', 'tools', 'system'].map((group) => (
          <div key={group} className="mb-3">
            {open && (
              <div className="text-[10px] font-semibold text-cyber-muted uppercase tracking-widest px-3 py-1 mb-1">
                {group === 'main' ? 'Investigation' : group === 'tools' ? 'Tools' : 'System'}
              </div>
            )}
            {NAV_ITEMS.filter((n) => n.group === group).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/10 text-cyber-cyan border-r-2 border-cyber-cyan'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={`flex-shrink-0 transition-all ${isActive ? 'text-cyber-cyan drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]' : 'group-hover:text-cyber-cyan'}`} />
                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && open && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto"
                      >
                        <ChevronRight size={14} className="text-cyber-cyan" />
                      </motion.div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-cyber-border">
        <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${!open && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1"
              >
                <div className="text-xs font-semibold text-cyber-text whitespace-nowrap truncate">{user?.username || 'User'}</div>
                <div className="text-[10px] text-cyber-muted capitalize whitespace-nowrap">{user?.role || 'intern'}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {open && (
            <button onClick={handleLogout} className="text-cyber-muted hover:text-cyber-red transition-colors ml-auto flex-shrink-0" title="Logout">
              <LogOut size={15} />
            </button>
          )}
        </div>
        {!open && (
          <button onClick={handleLogout} className="w-full flex justify-center p-2 text-cyber-muted hover:text-cyber-red transition-colors mt-1" title="Logout">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: open ? 220 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-cyber-surface border-r border-cyber-border overflow-hidden flex-shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ duration: 0.25 }}
            className="fixed left-0 top-0 bottom-0 w-60 bg-cyber-surface border-r border-cyber-border z-30 lg:hidden flex flex-col"
          >
            <div className="flex justify-end p-3">
              <button onClick={onMobileClose} className="text-cyber-muted hover:text-cyber-text">
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
