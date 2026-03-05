/**
 * pages/RegisterPage.jsx
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api.js'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' })
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authAPI.register(form.username, form.email, form.password)
      setSuccess('Account created! Redirecting to login…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-ash-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        required
        placeholder={placeholder}
        className="neon-input w-full bg-ink-700 border border-ink-600 rounded-lg px-3.5 py-2.5
                   text-ash-100 placeholder-ash text-sm transition-all focus:border-neon/50"
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4"
         style={{ backgroundImage: 'radial-gradient(ellipse at 30% 100%, rgba(126,255,212,0.05) 0%, transparent 55%)' }}>

      <div className="glass rounded-2xl p-8 w-full max-w-sm shadow-glass animate-fade-up">

        <div className="flex items-center gap-2 mb-8">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon/10 border border-neon/30">
            <Zap size={16} className="text-neon" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-ash-100">NeuralChat</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-ash-100 mb-1">Create account</h1>
        <p className="text-sm text-ash mb-6">Start chatting with your documents</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Username" name="username" placeholder="your_username" />
          <Field label="Email" name="email" type="email" placeholder="you@example.com" />

          {/* Password with toggle */}
          <div>
            <label className="block text-xs font-medium text-ash-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min 8 characters"
                className="neon-input w-full bg-ink-700 border border-ink-600 rounded-lg px-3.5 py-2.5
                           text-ash-100 placeholder-ash text-sm transition-all focus:border-neon/50 pr-10"
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-ash-300 transition-colors">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Field label="Confirm password" name="confirm" type="password" placeholder="••••••••" />

          {error   && <p className="text-coral text-xs bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-neon  text-xs bg-neon/10  border border-neon/20  rounded-lg px-3 py-2">{success}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-neon text-ink-900 font-semibold rounded-lg py-2.5 text-sm
                       hover:bg-neon/90 active:scale-[0.98] transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-sm">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-ash mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-neon hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
