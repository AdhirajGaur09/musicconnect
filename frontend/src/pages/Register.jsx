import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Field } from '../components/common'
import toast from 'react-hot-toast'
import { Music2, Eye, EyeOff } from 'lucide-react'

const GENRES = ['Rock','Blues','Jazz','Pop','Hip-Hop','Classical','Folk','Electronic','Metal','Funk','Reggae','R&B']
const ROLES  = ['Guitarist','Bassist','Drummer','Vocalist','Pianist','Producer','Violinist','Flutist','Other']
const CITIES = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Mysuru']

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'Guitarist',
    city: 'Bangalore', experience: 'Beginner', genres: new Set(),
  })
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [step,     setStep]     = useState(1)   // 2-step form

  const toggleGenre = (g) => setForm(p => {
    const gs = new Set(p.genres)
    gs.has(g) ? gs.delete(g) : gs.add(g)
    return { ...p, genres: gs }
  })

  const nextStep = () => {
    if (!form.name.trim())  { toast.error('Enter your name');  return }
    if (!form.email.trim()) { toast.error('Enter your email'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.genres.size === 0) { toast.error('Select at least one genre'); return }
    setLoading(true)
    try {
      await register({ ...form, genres: [...form.genres] })
      toast.success('Welcome to MusicConnect! 🎶')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 relative overflow-hidden"
         style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,106,255,0.1) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="w-full max-w-[500px] relative z-10"
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

          <h1 className="font-head text-2xl font-extrabold text-center mb-1">Join the community</h1>
          <p className="text-center text-sm text-[var(--text2)] mb-6">
            Create your musician profile in 60 seconds
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1,2].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300
                ${s <= step ? 'bg-accent' : 'bg-[var(--surface2)]'}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            {step === 1 && (
              <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name">
                    <input className="input" placeholder="Ravi Shankar"
                      value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} />
                  </Field>
                  <Field label="City">
                    <select className="input" value={form.city} onChange={e => setForm(p=>({...p,city:e.target.value}))}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Email">
                  <input className="input" type="email" placeholder="your@email.com"
                    value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text2)]">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <button type="button" onClick={nextStep}
                  className="btn-primary w-full py-3 text-base font-head font-bold mt-2 justify-center">
                  Continue →
                </button>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Primary Role">
                    <select className="input" value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Experience Level">
                    <select className="input" value={form.experience} onChange={e => setForm(p=>({...p,experience:e.target.value}))}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Professional</option>
                    </select>
                  </Field>
                </div>

                <Field label="Genres (select all that apply)">
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {GENRES.map(g => (
                      <button key={g} type="button" onClick={() => toggleGenre(g)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center
                          ${form.genres.has(g)
                            ? 'bg-[rgba(124,106,255,0.15)] border-accent text-[var(--accent3)]'
                            : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-[var(--accent)]'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 justify-center">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="btn-primary flex-[2] py-3 text-base font-head font-bold justify-center">
                    {loading ? 'Creating…' : 'Create My Profile →'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-[var(--text2)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent3)] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
