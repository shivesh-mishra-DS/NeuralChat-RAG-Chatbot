/**
 * pages/ChatPage.jsx
 * Full-featured RAG chat interface with sidebar, upload, and history
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  Send, Upload, LogOut, Trash2, FileText,
  Zap, ChevronLeft, ChevronRight, X, CheckCircle2,
} from 'lucide-react'

import { useAuth } from '../frontend/AuthContext.jsx'
import { chatAPI } from "../services/api";

// ── Typing indicator component ─────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="dot" /><span className="dot" /><span className="dot" />
    </div>
  )
}

// ── Single message bubble ──────────────────────────────────────────────────
function MessageBubble({ role, content, time }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neon/10 border border-neon/25
                         flex items-center justify-center mt-0.5">
          <Zap size={12} className="text-neon" />
        </span>
      )}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-neon/15 border border-neon/20 text-ash-100 rounded-tr-sm'
            : 'bg-ink-700 border border-ink-600 text-ash-200 rounded-tl-sm prose-chat'
          }`}>
          {isUser
            ? <p>{content}</p>
            : <ReactMarkdown>{content}</ReactMarkdown>
          }
        </div>
        {time && (
          <span className="text-[10px] text-ash/50 px-1">
            {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      {isUser && (
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ash/10 border border-ash/20
                         flex items-center justify-center mt-0.5 text-[11px] font-semibold text-ash-300">
          U
        </span>
      )}
    </div>
  )
}

// ── Main ChatPage ──────────────────────────────────────────────────────────
export default function ChatPage() {
  const navigate  = useNavigate()
  const { username, logout } = useAuth()

  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [thinking,   setThinking]   = useState(false)
  const [sidebarOpen, setSidebar]   = useState(true)
  const [documents,  setDocuments]  = useState([])
  const [uploadMsg,  setUploadMsg]  = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [histLoaded, setHistLoaded] = useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const fileRef    = useRef(null)

  // ── Load history on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [histRes, docRes] = await Promise.all([
          chatAPI.getHistory(),
          chatAPI.getDocuments(),
        ])
        setMessages(histRes.data.map((m) => ({ ...m, id: Math.random() })))
        setDocuments(docRes.data.documents || [])
      } catch (_) {}
      setHistLoaded(true)
    })()
  }, [])

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || thinking) return

    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages((p) => [...p, userMsg])
    setInput('')
    setThinking(true)

    try {
      const { data } = await chatAPI.sendMessage(text)
      const botMsg = { id: Date.now() + 1, role: 'assistant', content: data.answer }
      setMessages((p) => [...p, botMsg])
    } catch (err) {
      setMessages((p) => [
        ...p,
        { id: Date.now() + 1, role: 'assistant', content: '⚠️ Something went wrong. Please try again.' },
      ])
    } finally {
      setThinking(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, thinking])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Clear history ────────────────────────────────────────────────────────
  const clearHistory = async () => {
    if (!confirm('Clear all chat history?')) return
    await chatAPI.clearHistory()
    setMessages([])
  }

  // ── Upload document ──────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const { data } = await chatAPI.uploadDocument(file)
      setUploadMsg(`✓ "${data.filename}" ingested (${data.chunks} chunks)`)
      const docRes = await chatAPI.getDocuments()
      setDocuments(docRes.data.documents || [])
    } catch (err) {
      setUploadMsg('✗ ' + (err.response?.data?.detail || 'Upload failed'))
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-ink text-ash-200">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 border-r border-ink-600
                         ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>

        <div className="p-5 border-b border-ink-600 flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon/10 border border-neon/30">
            <Zap size={15} className="text-neon" />
          </span>
          <span className="font-display font-bold text-base text-ash-100">NeuralChat</span>
        </div>

        {/* Upload section */}
        <div className="p-4 border-b border-ink-600">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ash/50 mb-3">
            Knowledge Base
          </p>

          <label className={`flex items-center gap-2 w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm
                            border border-dashed transition-all
                            ${uploading
                              ? 'border-ash/20 text-ash/40'
                              : 'border-neon/30 text-neon hover:bg-neon/5'}`}>
            <Upload size={14} />
            <span className="font-medium">{uploading ? 'Uploading…' : 'Upload PDF / TXT'}</span>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleUpload} />
          </label>

          {uploadMsg && (
            <p className={`text-[11px] mt-2 ${uploadMsg.startsWith('✓') ? 'text-neon' : 'text-coral'}`}>
              {uploadMsg}
            </p>
          )}
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ash/50 mb-2">
            Documents ({documents.length})
          </p>
          {documents.length === 0
            ? <p className="text-xs text-ash/40 italic">No documents yet</p>
            : documents.map((doc, i) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b border-ink-600 last:border-0">
                <FileText size={12} className="text-neon mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-ash-300 break-all leading-tight">{doc.filename}</p>
                  <p className="text-[10px] text-ash/40">{doc.chunks} chunks</p>
                </div>
              </div>
            ))}
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-ink-600 space-y-1">
          <button onClick={clearHistory}
            className="flex items-center gap-2 w-full text-xs text-ash hover:text-coral transition-colors px-2 py-2 rounded-lg hover:bg-coral/5">
            <Trash2 size={13} /> Clear history
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full text-xs text-ash hover:text-ash-300 transition-colors px-2 py-2 rounded-lg hover:bg-ash/5">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main chat area ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-ink-600 bg-ink-800/60 backdrop-blur">
          <button
            onClick={() => setSidebar(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-ash/10 text-ash transition-colors">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-sm text-ash-100">AI Assistant</h2>
            <p className="text-[11px] text-ash/50">
              {documents.length > 0 ? `RAG mode · ${documents.length} doc(s) loaded` : 'General chat mode'}
            </p>
          </div>
          <span className="text-xs text-ash/50 font-mono">{username}</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
             style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(126,255,212,0.03) 0%, transparent 50%)' }}>

          {!histLoaded && (
            <div className="flex justify-center">
              <span className="text-xs text-ash/40 animate-pulse">Loading history…</span>
            </div>
          )}

          {histLoaded && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
              <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center">
                <Zap size={24} className="text-neon" />
              </div>
              <div className="text-center">
                <h3 className="font-display font-semibold text-ash-100 mb-1">Ready to chat</h3>
                <p className="text-sm text-ash/60 max-w-xs">
                  {documents.length > 0
                    ? 'Ask anything about your uploaded documents.'
                    : 'Upload a PDF or TXT to enable RAG, or just start chatting.'}
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} time={m.created_at} />
          ))}

          {thinking && (
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neon/10 border border-neon/25
                               flex items-center justify-center mt-0.5">
                <Zap size={12} className="text-neon" />
              </span>
              <div className="bg-ink-700 border border-ink-600 rounded-2xl rounded-tl-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-4 border-t border-ink-600 bg-ink-800/40 backdrop-blur">
          <div className="flex items-end gap-2 bg-ink-700 border border-ink-600 rounded-xl px-4 py-3
                          focus-within:border-neon/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-ash-100 placeholder-ash/40
                         outline-none max-h-32 leading-relaxed"
              style={{ scrollbarWidth: 'none' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-neon flex items-center justify-center
                         hover:bg-neon/90 active:scale-95 transition-all duration-150
                         disabled:opacity-30 disabled:cursor-not-allowed shadow-neon-sm">
              <Send size={14} className="text-ink-900" />
            </button>
          </div>
          <p className="text-center text-[10px] text-ash/30 mt-2">
            NeuralChat may produce inaccurate information. Verify important facts.
          </p>
        </div>

      </main>
    </div>
  )
}
