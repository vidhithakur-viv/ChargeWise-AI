import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/heatmap', label: 'Heatmap' },
  { to: '/heatmap', label: 'Desert Detection', state: { layer: 'deserts' } },
  { to: '/dashboard', label: 'Recommendations', state: { tab: 'recs' } },
  { to: '/roi', label: 'ROI Calculator' },
  { to: '/copilot', label: 'AI Copilot' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[0px_0px_20px_rgba(0,255,136,0.08)]">
      <div className="flex items-center gap-8">
        <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface hover:text-primary-container transition-colors">
          ChargeWise AI
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {links.map(({ to, label }) => (
            <Link
              key={label}
              to={to}
              className={pathname === to
                ? 'nav-link-active'
                : 'nav-link'}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex bg-white/5 rounded-full px-3 py-1 border border-white/10 items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          <span className="text-xs font-label-caps text-primary-container tracking-widest">GRID: OPTIMAL</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer p-2 hover:bg-white/10 rounded-full">account_circle</span>

        <button
          className="md:hidden material-symbols-outlined text-on-surface p-2"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? 'close' : 'menu'}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-surface-container-lowest border-b border-outline-variant py-4 px-6 flex flex-col gap-3 md:hidden"
          >
            {links.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={pathname === to ? 'nav-link-active' : 'nav-link'}
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
