/**
 * pages/LoginPage.jsx
 * Dark, editorial login with neon accent
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { authAPI } from '../services/api.js'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form.username, form.password)
      login(data.access_token, data.username)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4"
         style={{ backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(126,255,212,0.06) 0%, transparent 60%)' }}>

      {/* Card */}
      <div className="glass rounded-2xl p-8 w-full max-w-sm shadow-glass animate-fade-up">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon/10 border border-neon/30">
            <Zap size={16} className="text-neon" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-ash-100">NeuralChat</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-ash-100 mb-1">Welcome back</h1>
        <p className="text-sm text-ash mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-ash-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="your_username"
              className="neon-input w-full bg-ink-700 border border-ink-600 rounded-lg px-3.5 py-2.5
                         text-ash-100 placeholder-ash text-sm transition-all focus:border-neon/50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-ash-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="neon-input w-full bg-ink-700 border border-ink-600 rounded-lg px-3.5 py-2.5
                           text-ash-100 placeholder-ash text-sm transition-all focus:border-neon/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-ash-300 transition-colors"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-coral text-xs bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon text-ink-900 font-semibold rounded-lg py-2.5 text-sm
                       hover:bg-neon/90 active:scale-[0.98] transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-ash mt-6">
          No account?{' '}
          <Link to="/register" className="text-neon hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
