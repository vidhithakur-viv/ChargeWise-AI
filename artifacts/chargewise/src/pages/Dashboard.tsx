import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

const revenueData = [
  { month: 'Jan', projected: 280, prev: 190 },
  { month: 'Feb', projected: 340, prev: 220 },
  { month: 'Mar', projected: 290, prev: 240 },
  { month: 'Apr', projected: 420, prev: 270 },
  { month: 'May', projected: 500, prev: 310 },
  { month: 'Jun', projected: 460, prev: 350 },
  { month: 'Jul', projected: 610, prev: 390 },
  { month: 'Aug', projected: 720, prev: 420 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel px-3 py-2 rounded-lg text-xs">
        <p className="mb-1" style={{ color: '#b9cbb9' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const KPI_COLORS: Record<string, { icon: string; text: string; bg: string }> = {
  'primary-container': { icon: '#00ff88', text: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
  'secondary-container': { icon: '#00e3fd', text: '#00e3fd', bg: 'rgba(0,227,253,0.1)' },
  'error': { icon: '#ffb4ab', text: '#ffb4ab', bg: 'rgba(255,180,171,0.1)' },
  'tertiary-container': { icon: '#d6def8', text: '#d6def8', bg: 'rgba(214,222,248,0.1)' },
}

export default function Dashboard() {
  const [recs, setRecs] = useState<any[]>([])
  const [deserts, setDeserts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('realtime')

  useEffect(() => {
    Promise.all([api.getRecommendations(), api.getDeserts()])
      .then(([r, d]) => {
        setRecs(r.recommendations || [])
        setDeserts(d.deserts || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const kpis = [
    { label: 'Total Opportunities', value: recs.length || '—', icon: 'explore', colorKey: 'primary-container', sub: `+${recs.length > 0 ? '12.5' : '0'}% VS LAST MONTH`, subIcon: 'trending_up' },
    { label: 'Predicted Revenue', value: recs.length > 0 ? `₹${(recs.slice(0,10).reduce((a: number, r: any) => a + r.estimated_roi * 6, 0) / 100).toFixed(1)}Cr` : '—', icon: 'payments', colorKey: 'secondary-container', sub: 'CONFIDENCE 94.2%', subIcon: 'show_chart' },
    { label: 'Charging Deserts', value: deserts.length || '—', icon: 'warning', colorKey: 'error', sub: 'UNDERSERVED ZONES', subIcon: 'location_searching' },
    { label: 'Top Site Score', value: recs[0]?.score ?? '—', icon: 'bolt', colorKey: 'tertiary-container', sub: 'TOP QUARTILE', subIcon: 'star' },
  ]

  const demandData = deserts.slice(0, 5).map((d: any) => ({ name: d.name?.replace('Bengaluru ', '').slice(0, 12), score: d.demand_score }))

  return (
    <div className="min-h-screen" style={{ background: '#0e0e0e', color: '#e5e2e1' }}>
      <Navbar />

      <aside className="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-20 border-r border-white/10 shadow-2xl w-64 z-40" style={{ background: '#0e0e0e' }}>
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,255,136,0.2)', border: '1px solid rgba(0,255,136,0.3)' }}>
              <span className="material-symbols-outlined" style={{ color: '#00ff88' }}>electric_bolt</span>
            </div>
            <div>
              <h3 className="font-label-caps text-label-caps">Fleet Manager</h3>
              <p className="text-[10px] font-label-caps tracking-widest" style={{ color: '#00ff88' }}>ENTERPRISE TIER</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 mt-4">
          {[
            { icon: 'dashboard', label: 'Overview', to: '/dashboard', active: true },
            { icon: 'map', label: 'Live Map', to: '/heatmap' },
            { icon: 'electric_bolt', label: 'Grid Analysis', to: '/heatmap' },
            { icon: 'payments', label: 'Financials', to: '/roi' },
            { icon: 'psychology', label: 'AI Insights', to: '/copilot' },
          ].map(({ icon, label, to, active }) => (
            <Link key={label} to={to}
              className="flex items-center gap-3 p-4 font-label-caps text-label-caps hover:translate-x-1 transition-all duration-200"
              style={active ? { background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderRight: '4px solid #00ff88' } : { color: '#b9cbb9' }}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button className="w-full font-label-caps text-label-caps py-3 rounded-lg neon-glow-btn transition-all" style={{ background: '#00ff88', color: '#003919' }}>
            Upgrade to Pro
          </button>
        </div>
      </aside>

      <main className="lg:pl-64 pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-white mb-2 font-semibold">Executive Dashboard</h1>
                <p className="font-body-md" style={{ color: '#b9cbb9' }}>Real-time infrastructure intelligence for Bengaluru EV networks.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-1 flex border border-white/10" style={{ background: '#2a2a2a' }}>
                  {['realtime', 'predictive'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className="px-4 py-2 rounded font-label-caps text-[10px] transition-all"
                      style={tab === t ? { background: '#00ff88', color: '#003919' } : { color: '#b9cbb9' }}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {kpis.map(({ label, value, icon, colorKey, sub, subIcon }) => {
                const c = KPI_COLORS[colorKey]
                return (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="glass-card shimmer-border p-6 rounded-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-label-caps text-label-caps" style={{ color: '#b9cbb9' }}>{label}</span>
                      <div className="p-2 rounded-lg" style={{ background: c.bg, color: c.icon }}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </div>
                    </div>
                    <div className="font-metric-xl text-metric-xl text-white mb-2 font-bold">
                      {loading ? <span className="animate-pulse text-2xl" style={{ color: '#b9cbb9' }}>...</span> : value}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-label-caps" style={{ color: c.text }}>
                      <span className="material-symbols-outlined text-sm">{subIcon}</span>
                      <span>{sub}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="grid grid-cols-12 gap-6 mb-8">
              <div className="col-span-12 xl:col-span-8 glass-card p-8 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-white">Revenue Forecast</h3>
                    <p className="text-sm" style={{ color: '#b9cbb9' }}>Quarterly projected earnings</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-label-caps" style={{ color: '#b9cbb9' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: '#00ff88' }}></div> Projected
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-label-caps" style={{ color: '#b9cbb9' }}>
                      <div className="w-2 h-2 rounded-full bg-white/20"></div> Previous
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="proj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: '#b9cbb9', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="prev" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth={2} name="Previous" />
                    <Area type="monotone" dataKey="projected" stroke="#00ff88" fill="url(#proj)" strokeWidth={3} name="Projected" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="col-span-12 xl:col-span-4 glass-card p-8 rounded-xl flex flex-col">
                <h3 className="font-headline-md text-headline-md text-white mb-2">Coverage Analysis</h3>
                <p className="text-sm mb-6" style={{ color: '#b9cbb9' }}>Infrastructure saturation levels</p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="44%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle cx="50%" cy="50%" r="44%" fill="none" stroke="#00ff88" strokeWidth="10" strokeDasharray="276" strokeDashoffset="60" strokeLinecap="round" />
                      <circle cx="50%" cy="50%" r="44%" fill="none" stroke="#00e3fd" strokeWidth="10" strokeDasharray="276" strokeDashoffset="200" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="font-headline-md text-headline-md text-white font-semibold">78%</div>
                      <div className="text-[10px] font-label-caps" style={{ color: '#b9cbb9' }}>GLOBAL AVG</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs font-label-caps">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#00ff88' }}></div>High Demand (42%)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-label-caps">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#00e3fd' }}></div>Developing (36%)
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-6 glass-card p-8 rounded-xl">
                <h3 className="font-headline-md text-headline-md text-white mb-6">Desert Demand Scores</h3>
                {loading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>)}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={demandData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#b9cbb9', fontSize: 10, fontFamily: 'Space Mono' }} width={90} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {demandData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? '#00ff88' : `rgba(0,255,136,${0.6 - i * 0.1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="col-span-12 md:col-span-6 glass-card p-8 rounded-xl">
                <h3 className="font-headline-md text-headline-md text-white mb-6">Top ROI Sites</h3>
                <div className="space-y-3">
                  {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>)
                  ) : recs.slice(0, 5).map((r: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-label-caps mb-1">
                        <span className="truncate max-w-[150px]" style={{ color: '#b9cbb9' }}>{r.location}</span>
                        <span style={{ color: '#00ff88' }}>{r.estimated_roi}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(r.estimated_roi * 3, 100)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: '#00ff88' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-headline-md text-headline-md text-white">Top Opportunities</h3>
                  <p className="text-sm" style={{ color: '#b9cbb9' }}>AI-identified high-probability locations in Bengaluru</p>
                </div>
                <Link to="/heatmap">
                  <button className="px-6 py-2 rounded-lg font-label-caps text-label-caps transition-all border" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderColor: 'rgba(0,255,136,0.2)' }}>
                    VIEW ON MAP
                  </button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/5">
                    <tr>
                      {['Rank', 'Location', 'Score', 'Est. ROI', 'Daily Sessions', 'Payback', 'Action'].map(h => (
                        <th key={h} className="px-6 py-4 font-label-caps text-label-caps" style={{ color: '#b9cbb9' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>{Array(7).fill(0).map((_, j) => (
                          <td key={j} className="px-6 py-4"><div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div></td>
                        ))}</tr>
                      ))
                    ) : recs.slice(0, 10).map((r: any) => (
                      <tr key={r.rank} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-label-caps" style={{ color: '#b9cbb9' }}>#{r.rank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span className="material-symbols-outlined text-sm" style={{ color: '#00ff88' }}>location_on</span>
                            </div>
                            <span className="font-medium text-white text-sm">{r.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-label-caps" style={{ color: '#00ff88' }}>{r.score}</td>
                        <td className="px-6 py-4 font-label-caps text-white">{r.estimated_roi}%</td>
                        <td className="px-6 py-4 font-label-caps" style={{ color: '#b9cbb9' }}>{r.expected_daily_sessions}/day</td>
                        <td className="px-6 py-4 font-label-caps" style={{ color: '#b9cbb9' }}>{r.payback_months}mo</td>
                        <td className="px-6 py-4">
                          <Link to="/roi">
                            <button className="px-3 py-1 rounded-full text-[10px] font-label-caps border transition-all" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderColor: 'rgba(0,255,136,0.2)' }}>
                              ANALYZE
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
