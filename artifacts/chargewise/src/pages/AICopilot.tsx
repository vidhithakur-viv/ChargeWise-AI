import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

interface Message { role: 'user' | 'ai'; content: string; time: string; isError?: boolean }

const SUGGESTED_PROMPTS = [
  'Where should I build in Bengaluru?',
  'Which areas are charging deserts?',
  'What is the best ROI location?',
  'How many underserved zones exist?',
  'Compare north vs south Bengaluru',
]

const GREETING: Message = {
  role: 'ai',
  content: 'Greetings, Fleet Manager. I am synchronized with the grid data for Bengaluru. I can answer questions about the best charging station locations, charging deserts, ROI potential, and recommendations. How can I assist with your infrastructure strategy today?',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text: string) => {
    const question = text.trim()
    if (!question || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(true)
    try {
      const data = await api.askCopilot('bengaluru', question)
      setMessages(prev => [...prev, { role: 'ai', content: data.answer || 'I could not process that request.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Please ensure the backend server is running.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#131313', color: '#e5e2e1' }}>
      <Navbar />

      <aside className="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-20 border-r border-white/10 w-64 z-40" style={{ background: '#0e0e0e' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center neon-glow">
              <span className="material-symbols-outlined" style={{ color: '#00ff88' }}>psychology</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps" style={{ color: '#f1ffef' }}>AI ENGINE</p>
              <p className="text-xs" style={{ color: '#b9cbb9' }}>v4.2 Neural Link</p>
            </div>
          </div>
          <nav className="space-y-1">
            <p className="px-4 mb-3 font-label-caps text-label-caps opacity-50 uppercase tracking-widest text-[10px]" style={{ color: '#b9cbb9' }}>History</p>
            {['Bengaluru Site ROI', 'Desert Zone Analysis', 'Grid Peak Hours'].map((label, i) => (
              <button key={label}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:translate-x-1 transition-all duration-200 text-left"
                style={i === 0 ? { background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderRight: '4px solid #00ff88' } : { color: '#b9cbb9' }}
              >
                <span className="material-symbols-outlined text-sm">{i === 0 ? 'chat_bubble' : 'history'}</span>
                <span className="font-body-md text-sm truncate">{label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-10">
            <p className="px-4 mb-3 font-label-caps text-label-caps opacity-50 uppercase tracking-widest text-[10px]" style={{ color: '#b9cbb9' }}>City Context</p>
            <div className="px-4 space-y-3">
              {[{ label: 'Active City', val: 'BENGALURU' }, { label: 'Data Points', val: 'LIVE' }].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span style={{ color: '#b9cbb9' }}>{label}</span>
                  <span className="font-label-caps text-[11px]" style={{ color: '#00ff88' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-white/10 space-y-3">
          <button className="w-full py-3 px-4 glass-panel rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-label-caps text-label-caps" style={{ color: '#e5e2e1' }}>
            <span className="material-symbols-outlined text-sm">settings</span> Configuration
          </button>
          <button className="w-full py-3 px-4 font-label-caps text-label-caps rounded-lg neon-glow-btn transition-all flex items-center justify-center gap-2" style={{ background: '#00ff88', color: '#003919' }}>
            <span className="material-symbols-outlined text-sm">bolt</span> Upgrade to Pro
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-20 h-screen flex flex-col px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-6 flex justify-between items-end pt-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg tracking-tight font-semibold" style={{ color: '#e5e2e1' }}>AI Copilot</h1>
            <p className="mt-1 text-sm" style={{ color: '#b9cbb9' }}>Infrastructure optimization powered by generative intelligence.</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-label-caps border px-3 py-1 rounded-full" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff88' }}></span>
            Live Connection
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pb-8 pr-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16, x: msg.role === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border"
                  style={msg.role === 'ai' ? { boxShadow: '0px 0px 15px rgba(0,255,136,0.1)', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(0,255,136,0.3)', backdropFilter: 'blur(20px)' } : { background: '#2a2a2a', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: msg.role === 'ai' ? '#00ff88' : '#b9cbb9' }}>
                    {msg.role === 'ai' ? 'smart_toy' : 'person'}
                  </span>
                </div>
                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="p-5 rounded-2xl"
                    style={msg.role === 'user'
                      ? { background: '#00ff88', color: '#003919', borderTopRightRadius: 0 }
                      : msg.isError
                        ? { background: 'rgba(255,255,255,0.03)', borderTopLeftRadius: 0, border: '1px solid rgba(255,180,171,0.3)', color: '#ffb4ab', backdropFilter: 'blur(20px)' }
                        : { background: 'rgba(255,255,255,0.03)', borderTopLeftRadius: 0, border: '1px solid rgba(255,255,255,0.1)', color: '#e5e2e1', backdropFilter: 'blur(20px)' }
                    }
                  >
                    <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] font-label-caps mt-2 block mx-1" style={{ color: '#b9cbb9' }}>
                    {msg.role === 'ai' ? 'AI • ' : 'YOU • '}{msg.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full glass-panel border border-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined animate-pulse text-sm" style={{ color: 'rgba(0,255,136,0.5)' }}>smart_toy</span>
                </div>
                <div className="glass-panel px-4 py-3 rounded-full flex gap-1.5 items-center">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#00ff88', animationDelay: `${delay}ms` }}></span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          {SUGGESTED_PROMPTS.map(prompt => (
            <button key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}
              className="flex-shrink-0 px-3 py-2 glass-panel rounded-full text-xs hover:border-white/30 transition-all whitespace-nowrap active:scale-95 disabled:opacity-40"
              style={{ color: '#b9cbb9' }}>
              "{prompt}"
            </button>
          ))}
        </div>

        <div className="pb-6">
          <div className="glass-panel p-2 rounded-2xl shimmer-border flex items-center gap-3 neon-glow shadow-2xl">
            <span className="material-symbols-outlined p-2" style={{ color: '#b9cbb9' }}>chat</span>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              disabled={loading}
              placeholder="Ask about Bengaluru EV infrastructure..."
              className="flex-1 bg-transparent border-none focus:outline-none font-body-md py-3 px-1 disabled:opacity-50"
              style={{ color: '#e5e2e1' }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
              className="p-3 rounded-xl neon-glow-btn transition-all active:scale-90 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#00ff88', color: '#003919' }}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <p className="text-center text-[10px] font-label-caps mt-3 tracking-widest" style={{ color: 'rgba(185,203,185,0.3)' }}>
            ChargeWise Neural Core v4.2 • Secured Transmission
          </p>
        </div>
      </main>
    </div>
  )
}
