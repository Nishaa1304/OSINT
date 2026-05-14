import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useThemeStore } from '../../store/themeStore'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme } = useThemeStore()
  const isLight = theme === 'light'

  const toastStyle = {
    background: isLight ? '#ffffff' : '#0d1526',
    color: isLight ? '#0f172a' : '#e2e8f0',
    border: `1px solid ${isLight ? '#cbd5e1' : 'rgba(0,212,255,0.3)'}`,
    borderRadius: '10px',
    fontSize: '14px',
  }
  const toastIconTheme = {
    success: { iconTheme: { primary: '#00ff88', secondary: isLight ? '#ffffff' : '#0d1526' } },
    error: { iconTheme: { primary: '#ff3366', secondary: isLight ? '#ffffff' : '#0d1526' } },
  }

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex h-screen bg-cyber-bg grid-bg overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          onMobileMenu={() => setMobileOpen((p) => !p)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: toastStyle,
            ...toastIconTheme,
          }}
        />
      </div>
    </div>
  )
}
