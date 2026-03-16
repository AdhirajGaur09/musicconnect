import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Field } from '../components/common'
import toast from 'react-hot-toast'
import { Music2, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
         style={{ background: 'var(--bg)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,106,255,0.1) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="card p-10 border-[var(--border2)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-head font-extrabold text-xl">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <Music2 size={18} className="text-white" />
              </div>
              MusicConnect
            </Link>
          </div>

          <h1 className="font-head text-2xl font-extrabold text-center mb-1">Welcome back</h1>
          <p className="text-center text-sm text-[var(--text2)] mb-8">Sign in to your musician account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <input className="input" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text2)]">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base font-head font-bold mt-2 justify-center">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-[var(--text3)] my-5">— or —</div>

          <button className="btn-ghost w-full py-3 justify-center text-sm">
            Continue with Google
          </button>

          <p className="text-center text-sm text-[var(--text2)] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--accent3)] hover:underline font-medium">Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
