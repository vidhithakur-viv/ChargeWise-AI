import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from 'recharts'
import Navbar from '../components/Navbar'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

const DEFAULT = {
  chargers: 4,
  price_per_kwh: 0.45,
  sessions_per_day: 20,
  avg_kwh_per_session: 18,
  setup_cost_per_charger: 600000,
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel px-3 py-2 rounded-lg text-xs border border-white/10">
        <p className="text-on-surface-variant mb-1">Year {label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: ₹{(p.value / 100000).toFixed(1)}L
          </p>
        ))}
      </div>
    )
  }
  return null
}

function buildChartData(result) {
  if (!result) return []
  const { yearly_revenue, total_setup_cost } = result
  return Array.from({ length: 6 }, (_, i) => ({
    year: i,
    Revenue: Math.round(yearly_revenue * i),
    Cost: Math.round(total_setup_cost),
  }))
}

function ScoreGrade(roi) {
  if (roi >= 20) return { grade: 'A+', color: '#00ff88', label: 'Exceptional' }
  if (roi >= 15) return { grade: 'A', color: '#00ff88', label: 'Excellent' }
  if (roi >= 10) return { grade: 'B+', color: '#00e3fd', label: 'Very Good' }
  if (roi >= 5) return { grade: 'B', color: '#00e3fd', label: 'Good' }
  return { grade: 'C', color: '#b9cbb9', label: 'Moderate' }
}

export default function ROICalculator() {
  const [form, setForm] = useState(DEFAULT)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (key, val) => setForm(f => ({ ...f, [key]: parseFloat(val) || 0 }))

  const calculate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.calculateROI(form)
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const chartData = buildChartData(result)
  const grade = result ? ScoreGrade(result.roi_percentage) : null

  const profitabilityPct = result
    ? Math.min(100, Math.round((result.yearly_revenue / result.total_setup_cost) * 100 * 5))
    : 0

  const circumference = 2 * Math.PI * 45
  const dashoffset = circumference - (profitabilityPct / 100) * circumference

  return (
    <div className="bg-background min-h-screen text-on-background">
      <Navbar />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-20 w-64 bg-surface-container-lowest border-r border-outline-variant shadow-2xl z-40">
        <nav className="flex-1 mt-4">
          {[
            { icon: 'dashboard', label: 'Overview', to: '/dashboard' },
            { icon: 'map', label: 'Live Map', to: '/heatmap' },
            { icon: 'electric_bolt', label: 'Grid Analysis', to: '/heatmap' },
            { icon: 'payments', label: 'Financials', to: '/roi', active: true },
            { icon: 'psychology', label: 'AI Insights', to: '/copilot' },
          ].map(({ icon, label, to, active }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 p-4 font-label-caps text-label-caps hover:translate-x-1 transition-all duration-200 ${
                active
                  ? 'bg-primary-container/10 text-primary-container border-r-4 border-primary-container'
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-6"></div>
      </aside>

      <main className="pt-24 pb-12 px-6 lg:pl-72 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display-lg text-display-lg text-primary-fixed mb-2 font-bold">Infrastructure ROI Forecaster</h1>
          <p className="text-on-surface-variant font-body-lg max-w-2xl">
            AI-driven predictive modeling to calculate long-term profitability of EV charging site investments in Bengaluru.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="glass-card shimmer-border rounded-xl p-8">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">edit_document</span>
                Site Parameters
              </h2>

              <form className="space-y-6" onSubmit={e => { e.preventDefault(); calculate() }}>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">NUMBER OF CHARGERS</label>
                  <input
                    type="number" min="1" max="50"
                    value={form.chargers}
                    onChange={e => update('chargers', e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container transition-all text-on-surface focus:outline-none"
                  />
                  <input type="range" min="1" max="20" value={form.chargers}
                    onChange={e => update('chargers', e.target.value)}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">PRICE PER kWh (₹)</label>
                  <input
                    type="number" step="0.01" min="0.1"
                    value={form.price_per_kwh}
                    onChange={e => update('price_per_kwh', e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container transition-all text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">SESSIONS PER DAY</label>
                  <input
                    type="number" min="1"
                    value={form.sessions_per_day}
                    onChange={e => update('sessions_per_day', e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container transition-all text-on-surface focus:outline-none"
                  />
                  <input type="range" min="1" max="100" value={form.sessions_per_day}
                    onChange={e => update('sessions_per_day', e.target.value)}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">AVG kWh PER SESSION</label>
                  <input
                    type="number" step="0.5" min="5"
                    value={form.avg_kwh_per_session}
                    onChange={e => update('avg_kwh_per_session', e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container transition-all text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-2">SETUP COST PER CHARGER (₹)</label>
                  <input
                    type="number" step="10000"
                    value={form.setup_cost_per_charger}
                    onChange={e => update('setup_cost_per_charger', e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container transition-all text-on-surface focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary-container text-on-primary font-bold rounded-lg shadow-[0px_0px_20px_rgba(0,255,136,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">autorenew</span>
                      CALCULATING...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">calculate</span>
                      GENERATE FORECAST
                    </>
                  )}
                </button>
              </form>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm">
                  {error}
                </motion.div>
              )}
            </motion.div>

            {/* AI Insight Card */}
            <div className="glass-card rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-label-caps text-primary-container bg-primary-container/10 px-2 py-1 rounded text-[10px]">AI INSIGHT</span>
                <span className="material-symbols-outlined text-primary-container">bolt</span>
              </div>
              <p className="text-body-md text-on-surface leading-snug">
                {result
                  ? `Payback in ${result.payback_months} months. 5-year return multiplier: ${result.five_year_return_multiplier}×`
                  : 'Configure site parameters and calculate to see your AI-powered ROI forecast.'}
              </p>
              <Link to="/copilot" className="mt-4 block">
                <button className="text-primary-container font-label-caps text-[10px] flex items-center gap-1 hover:gap-2 transition-all">
                  ASK AI COPILOT <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'PAYBACK PERIOD', value: `${result.payback_months}`, unit: 'MONTHS', color: 'primary-container', icon: 'trending_up', sub: result.payback_months < 24 ? 'Top 5% of Sites' : 'Standard Timeline' },
                      { label: '1-YEAR ROI', value: `${result.roi_percentage}`, unit: '%', color: 'secondary-container', icon: 'verified', sub: `₹${(result.yearly_revenue / 100000).toFixed(1)}L annual revenue` },
                      { label: 'INVESTMENT GRADE', value: grade?.grade, unit: '', color: 'tertiary-container', icon: 'psychology', sub: grade?.label + ' — AI Verified' },
                    ].map(({ label, value, unit, color, icon, sub }) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`glass-card rounded-xl p-6 flex flex-col justify-between border-l-4 border-l-${color}`}
                      >
                        <span className="text-label-caps text-on-surface-variant">{label}</span>
                        <div className="flex items-baseline gap-2 mt-4">
                          <span className="font-metric-xl text-metric-xl text-on-surface font-bold">{value}</span>
                          {unit && <span className="text-body-lg text-on-surface-variant">{unit}</span>}
                        </div>
                        <div className={`mt-3 flex items-center text-${color} gap-1 text-xs font-label-caps`}>
                          <span className="material-symbols-outlined text-[14px]">{icon}</span>
                          <span>{sub}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Revenue Chart */}
                  <div className="glass-card rounded-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-headline-md text-headline-md text-on-surface">Revenue vs. Investment Over 5 Years</h3>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-label-caps text-on-surface-variant">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-container"></div> Revenue
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-label-caps text-on-surface-variant">
                          <div className="w-2.5 h-2.5 rounded-full bg-error/60"></div> Cost
                        </span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: '#b9cbb9', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: '#b9cbb9', fontSize: 9, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={result.total_setup_cost} stroke="rgba(255,100,100,0.4)" strokeDasharray="4 4" label={{ value: 'Break-even', fill: '#b9cbb9', fontSize: 10 }} />
                        <Area type="monotone" dataKey="Cost" stroke="rgba(255,100,100,0.5)" fill="none" strokeWidth={2} name="Cost" />
                        <Area type="monotone" dataKey="Revenue" stroke="#00ff88" fill="url(#revGrad)" strokeWidth={3} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bottom Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gauge */}
                    <div className="glass-card rounded-xl p-8 flex flex-col items-center text-center">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-6 w-full text-left">Profitability Score</h3>
                      <div className="relative w-44 h-44">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                          <motion.circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke={grade?.color || '#00ff88'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: dashoffset }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />
                          <text x="50" y="48" textAnchor="middle" fill="white" fontFamily="Geist" fontSize="18" fontWeight="700">{profitabilityPct}%</text>
                          <text x="50" y="62" textAnchor="middle" fill="#b9cbb9" fontFamily="Space Mono" fontSize="7">CONFIDENCE</text>
                        </svg>
                        <div className="absolute inset-0 blur-xl rounded-full" style={{ background: `${grade?.color || '#00ff88'}10` }}></div>
                      </div>
                      <p className="mt-4 text-on-surface-variant text-sm font-label-caps">OPTIMIZATION SCORE</p>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="glass-card rounded-xl p-8">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Financial Breakdown</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Daily Revenue', value: `₹${result.daily_revenue.toLocaleString()}`, color: 'text-primary-container' },
                          { label: 'Monthly Revenue', value: `₹${result.monthly_revenue.toLocaleString()}`, color: 'text-primary-container' },
                          { label: 'Annual Revenue', value: `₹${result.yearly_revenue.toLocaleString()}`, color: 'text-primary-container' },
                          { label: 'Total Setup Cost', value: `₹${result.total_setup_cost.toLocaleString()}`, color: 'text-error' },
                          { label: '5-Year Revenue', value: `₹${result.five_year_revenue.toLocaleString()}`, color: 'text-secondary-container' },
                          { label: '5-Year Profit', value: `₹${result.five_year_profit.toLocaleString()}`, color: result.five_year_profit > 0 ? 'text-primary-container' : 'text-error' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-on-surface-variant text-sm">{label}</span>
                            <span className={`font-label-caps text-sm ${color}`}>{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center font-bold pt-2">
                          <span className="text-on-surface">5-Year Return</span>
                          <span className="text-secondary-container font-metric-xl text-2xl">{result.five_year_return_multiplier}×</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center justify-center min-h-[400px]"
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary-container/40 text-8xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Configure & Calculate</h3>
                    <p className="text-on-surface-variant max-w-sm">
                      Set your site parameters on the left and click "Generate Forecast" to see your full ROI projection.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
