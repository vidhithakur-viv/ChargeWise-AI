import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/heatmap', label: 'Heatmap' },
  { to: '/heatmap', label: 'Desert Detection' },
  { to: '/roi', label: 'ROI Calculator' },
  { to: '/copilot', label: 'AI Copilot' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 backdrop-blur-xl border-b"
      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0px 0px 20px rgba(0,255,136,0.08)' }}>
      <div className="flex items-center gap-8">
        <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tighter hover:opacity-80 transition-opacity" style={{ color: '#e5e2e1' }}>
          ChargeWise AI
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {links.map(({ to, label }) => (
            <Link key={label} to={to}
              className="font-body-md text-body-md transition-colors duration-200"
              style={pathname === to ? { color: '#f1ffef', fontWeight: 700, borderBottom: '2px solid #00ff88', paddingBottom: '4px' } : { color: '#b9cbb9' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex rounded-full px-3 py-1 border items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff88' }}></span>
          <span className="text-xs font-label-caps tracking-widest" style={{ color: '#00ff88' }}>GRID: OPTIMAL</span>
        </div>
        <span className="material-symbols-outlined cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: '#b9cbb9' }}>account_circle</span>
        <button className="md:hidden material-symbols-outlined p-2" style={{ color: '#e5e2e1' }} onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? 'close' : 'menu'}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full border-b py-4 px-6 flex flex-col gap-3 md:hidden"
            style={{ background: '#0e0e0e', borderColor: '#3b4b3d' }}
          >
            {links.map(({ to, label }) => (
              <Link key={label} to={to} onClick={() => setMenuOpen(false)}
                className="font-body-md text-body-md transition-colors"
                style={pathname === to ? { color: '#00ff88', fontWeight: 700 } : { color: '#b9cbb9' }}>
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
