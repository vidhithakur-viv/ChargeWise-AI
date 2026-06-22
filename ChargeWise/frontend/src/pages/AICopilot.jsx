import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

const CITY = 'bengaluru'

const SUGGESTED_PROMPTS = [
  'Where should I build in Bengaluru?',
  'Which areas are charging deserts?',
  'What is the best ROI location?',
  'How many underserved zones exist?',
  'Compare north vs south Bengaluru',
]

const GREETING = {
  role: 'ai',
  content: 'Greetings, Fleet Manager. I am synchronized with the grid data for Bengaluru. I can answer questions about the best charging station locations, charging deserts, ROI potential, and recommendations. How can I assist with your infrastructure strategy today?',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

export default function AICopilot() {
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const question = text.trim()
    if (!question || loading) return
    setInput('')

    const userMsg = {
      role: 'user',
      content: question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await api.askCopilot(CITY, question)
      const aiMsg = {
        role: 'ai',
        content: data.answer || 'I could not process that request. Please try rephrasing.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Connection error. Please ensure the backend server is running.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="bg-background min-h-screen text-on-surface overflow-hidden">
      <Navbar />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-20 bg-surface-container-lowest border-r border-outline-variant w-64 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center neon-glow">
              <span className="material-symbols-outlined text-primary-container">psychology</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-primary">AI ENGINE</p>
              <p className="text-xs text-on-surface-variant">v4.2 Neural Link</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="px-4 mb-3 font-label-caps text-label-caps text-on-surface-variant opacity-50 uppercase tracking-widest text-[10px]">History</p>
            {['Bengaluru Site ROI', 'Desert Zone Analysis', 'Grid Peak Hours'].map((label, i) => (
              <button
                key={label}
                className={`w-full flex items-center gap-3 p-4 rounded-lg hover:translate-x-1 transition-all duration-200 text-left ${
                  i === 0
                    ? 'bg-primary-container/10 text-primary-container border-r-4 border-primary-container'
                    : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{i === 0 ? 'chat_bubble' : 'history'}</span>
                <span className="font-body-md text-sm truncate">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-10">
            <p className="px-4 mb-3 font-label-caps text-label-caps text-on-surface-variant opacity-50 uppercase tracking-widest text-[10px]">City Context</p>
            <div className="px-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Active City</span>
                <span className="text-primary-container font-label-caps text-[11px]">BENGALURU</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Data Points</span>
                <span className="text-primary-container font-label-caps text-[11px]">LIVE</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-outline-variant"></div>
      </aside>

      {/* Main Chat */}
      <main className="lg:ml-64 pt-20 h-screen flex flex-col px-6 max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 flex justify-between items-end pt-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">AI Copilot</h1>
            <p className="text-on-surface-variant mt-1 text-sm">Infrastructure optimization powered by generative intelligence.</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-label-caps bg-primary-container/10 text-primary-container border border-primary-container/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            Live Connection
          </span>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-8 pr-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, x: msg.role === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${
                  msg.role === 'ai'
                    ? 'glass-panel border-primary-container/30 shadow-[0px_0px_15px_rgba(0,255,136,0.1)]'
                    : 'bg-surface-container-high border-outline-variant'
                }`}>
                  <span className={`material-symbols-outlined text-sm ${msg.role === 'ai' ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                    {msg.role === 'ai' ? 'smart_toy' : 'person'}
                  </span>
                </div>

                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`p-5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary-container text-on-primary-container rounded-tr-none shadow-xl'
                      : msg.isError
                        ? 'glass-panel rounded-tl-none border border-error/30 text-error'
                        : 'glass-panel rounded-tl-none shimmer-border text-on-surface'
                  }`}>
                    <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] font-label-caps text-on-surface-variant mt-2 block mx-1">
                    {msg.role === 'ai' ? 'AI • ' : 'YOU • '}{msg.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full glass-panel border border-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container/50 animate-pulse text-sm">smart_toy</span>
                </div>
                <div className="glass-panel px-4 py-3 rounded-full flex gap-1.5 items-center">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="w-2 h-2 bg-primary-container rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}></span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          {SUGGESTED_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-2 glass-panel rounded-full text-xs text-on-surface-variant hover:text-primary hover:border-primary-container/50 transition-all whitespace-nowrap active:scale-95 disabled:opacity-40"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="pb-6">
          <div className="glass-panel p-2 rounded-2xl shimmer-border flex items-center gap-3 neon-glow shadow-2xl">
            <span className="material-symbols-outlined text-on-surface-variant p-2">chat</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder="Ask about Bengaluru EV infrastructure..."
              className="flex-1 bg-transparent border-none focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 font-body-md py-3 px-1 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-primary-container text-on-primary p-3 rounded-xl neon-glow-btn transition-all active:scale-90 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <p className="text-center text-[10px] font-label-caps text-on-surface-variant/30 mt-3 tracking-widest">
            ChargeWise Neural Core v4.2 • Secured Transmission
          </p>
        </div>
      </main>

      {/* Contextual Panel (xl screens) */}
      <div className="fixed right-6 top-28 w-64 hidden xl:block space-y-4">
        <div className="glass-panel p-5 rounded-2xl shimmer-border">
          <p className="font-label-caps text-label-caps text-primary-container mb-4">ACTIVE CONTEXT</p>
          <div className="space-y-3">
            {[
              { icon: 'location_on', label: 'Bengaluru Cluster', sub: 'All Zones Loaded' },
              { icon: 'trending_up', label: 'Growth Projection', sub: '+12% YoY Demand' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">{icon}</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface">{label}</p>
                  <p className="text-[10px] text-on-surface-variant">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-[10px] text-on-surface-variant mb-2">GRID STATUS</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-[76%]"></div>
              </div>
              <span className="text-[10px] text-primary-container">76%</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl shimmer-border">
          <p className="font-label-caps text-label-caps text-on-surface mb-3">AI AGENTS</p>
          <div className="flex -space-x-2">
            {[
              { bg: 'bg-secondary-container', text: 'text-on-secondary-container', icon: 'payments' },
              { bg: 'bg-primary-container', text: 'text-on-primary-container', icon: 'electric_bolt' },
              { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', icon: 'gavel' },
            ].map(({ bg, text, icon }) => (
              <div key={icon} className={`w-8 h-8 rounded-full border-2 border-background ${bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-xs ${text}`}>{icon}</span>
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] text-on-surface-variant">
              +2
            </div>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 leading-relaxed">
            Multi-domain experts parsing your query in real-time.
          </p>
        </div>
      </div>
    </div>
  )
}
