import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, User, Loader2, Trash2 } from 'lucide-react'
import GlowCard from '../components/ui/GlowCard'
import api from '../api/client'

const SUGGESTIONS = [
  'What is phishing?', 'How do I investigate an IP?',
  'What is OSINT?', 'Explain malware',
  'What does CRITICAL risk mean?', 'What is ransomware?',
]

function Msg({ msg }) {
  const isBot = msg.role === 'bot'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-gradient-to-br from-cyber-cyan to-cyber-blue' : 'bg-cyber-border'}`}>
        {isBot ? <Bot size={15} className="text-white"/> : <User size={15} className="text-cyber-muted"/>}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isBot ? 'glass-card-light text-cyber-text rounded-tl-none' : 'bg-cyber-cyan/10 text-cyber-text border border-cyber-cyan/20 rounded-tr-none'
      }`}>
        {msg.text}
        {msg.loading && (
          <span className="inline-flex gap-1 ml-2">
            {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce" style={{ animationDelay:`${i*0.15}s`}}/>)}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "👋 Hello! I'm your OSINT Intelligence Assistant.\n\nI can help you understand cybersecurity concepts, guide investigations, and explain threat indicators.\n\nWhat would you like to know?"
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(p => [...p, { role: 'user', text: msg }, { role: 'bot', text: '', loading: true }])
    setLoading(true)
    try {
      const { data } = await api.post('/chatbot/message', { message: msg })
      setMessages(p => [...p.slice(0,-1), { role: 'bot', text: data.assistant_response }])
    } catch {
      setMessages(p => [...p.slice(0,-1), { role: 'bot', text: "Connection error. Make sure the FastAPI backend is running on port 8000." }])
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-cyber-text flex items-center gap-2">
            <Bot size={20} className="text-cyber-cyan"/> AI Investigation Assistant
          </h2>
          <p className="text-sm text-cyber-muted">Cyber knowledge base powered assistant</p>
        </div>
        <button onClick={() => setMessages([{ role:'bot', text:'Chat cleared. How can I help you?' }])}
          className="flex items-center gap-1.5 text-xs text-cyber-muted hover:text-cyber-red transition-colors">
          <Trash2 size={13}/> Clear
        </button>
      </motion.div>

      <GlowCard className="flex-1 p-4 overflow-y-auto space-y-4 mb-3">
        {messages.map((msg, i) => <Msg key={i} msg={msg}/>)}
        <div ref={endRef}/>
      </GlowCard>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-cyber-cyan/5 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/15 transition-all">
            {s}
          </button>
        ))}
      </div>

      <GlowCard className="p-3">
        <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} disabled={loading}
            placeholder="Ask about cybersecurity, threats, OSINT techniques..."
            className="cyber-input flex-1 text-sm"/>
          <button type="submit" disabled={loading || !input.trim()} className="cyber-btn px-4 flex items-center gap-2 flex-shrink-0">
            {loading ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
          </button>
        </form>
      </GlowCard>
    </div>
  )
}
