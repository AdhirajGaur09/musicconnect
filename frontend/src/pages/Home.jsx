import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gigsAPI, usersAPI } from '../services/api'
import { Avatar, Badge } from '../components/common'
import { ArrowRight, Music2, Users, Mic2, Star } from 'lucide-react'
import { format } from 'date-fns'

const WAVE_HEIGHTS = [8,12,20,28,24,16,10,14,22,26,20,14,10,16,24,28,22,16,10,12,8]

const FEATURES = [
  { icon: '🎸', title: 'Find Bandmates', desc: 'Search musicians by instrument, genre, city, and experience level. Connect instantly.', color: 'rgba(124,106,255,0.12)' },
  { icon: '🎤', title: 'Book Gigs',      desc: 'Post and apply for live performance opportunities. Get paid to play the music you love.', color: 'rgba(52,211,153,0.1)' },
  { icon: '🥁', title: 'Form Bands',     desc: 'Invite musicians, manage your lineup, and build the perfect ensemble for any genre.', color: 'rgba(34,211,238,0.1)' },
  { icon: '🎹', title: 'Collaborate',    desc: 'Work on original music, covers, or studio sessions with talented local artists.', color: 'rgba(245,200,66,0.1)' },
  { icon: '📊', title: 'Track Progress', desc: 'Your dashboard shows applied gigs, collaboration requests, and profile analytics.', color: 'rgba(244,114,182,0.1)' },
  { icon: '🌟', title: 'Build Your Rep', desc: 'Get rated by collaborators. Build a portfolio that gets you hired again and again.', color: 'rgba(251,146,60,0.1)' },
]

const STEPS = [
  { num: '01', title: 'Create Your Profile', desc: 'List your instruments, genres, city, and experience. Let your talent speak.' },
  { num: '02', title: 'Discover & Connect',  desc: 'Browse musicians near you or post a gig. Filter by exactly what you need.' },
  { num: '03', title: 'Make Music Together', desc: 'Collaborate, rehearse, perform. Build your musical network city by city.' },
]

export default function Home() {
  const [recentGigs,    setRecentGigs]    = useState([])
  const [topMusicians,  setTopMusicians]  = useState([])

  useEffect(() => {
    gigsAPI.getAll({ limit: 3 }).then(r => setRecentGigs(r.data)).catch(() => {})
    usersAPI.getAll({ limit: 6 }).then(r => setTopMusicians(r.data)).catch(() => {})
  }, [])

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.45 } },
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,106,255,0.12) 0%, transparent 70%)' }} />
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb w-[420px] h-[420px] bg-accent -top-24 -left-12" style={{ animationDelay: '0s' }} />
          <div className="orb w-[300px] h-[300px] bg-[var(--cyan)] top-12 -right-20" style={{ animationDelay: '3s' }} />
          <div className="orb w-[250px] h-[250px] bg-[var(--pink)] -bottom-20 left-[35%]" style={{ animationDelay: '6s' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <div className="inline-flex items-center gap-2 bg-[rgba(124,106,255,0.1)] border border-[rgba(124,106,255,0.25)] rounded-full px-4 py-1.5 text-xs font-medium text-[var(--accent3)] mb-6">
              <span className="text-[var(--green)]">●</span> 2,400+ musicians connected this month
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="font-head font-extrabold leading-[1.05] tracking-tight mb-5"
            style={{ fontSize: 'clamp(42px, 7vw, 76px)' }}
          >
            Connect With<br />
            <span className="text-[var(--accent2)]">Musicians</span><br />
            In Your City
          </motion.h1>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="text-[var(--text2)] text-lg max-w-[520px] mx-auto mb-9">
            Find bandmates, book gigs, and build something extraordinary with local talent.
          </motion.p>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="flex gap-3 justify-center flex-wrap">
            <Link to="/discover" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent
              text-white font-head font-bold text-base transition-all duration-200
              hover:bg-[#6b59ee] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,106,255,0.4)]">
              Find Musicians <ArrowRight size={16} />
            </Link>
            <Link to="/gigs" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
              bg-transparent text-[var(--text)] font-head font-bold text-base
              border border-[var(--border2)] transition-all duration-200
              hover:border-accent hover:text-[var(--accent3)] hover:bg-[rgba(124,106,255,0.08)]">
              Browse Gigs
            </Link>
          </motion.div>

          {/* Wave animation */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            className="flex items-end justify-center gap-1 h-9 mt-12">
            {WAVE_HEIGHTS.map((h, i) => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.07}s`, height: h }} />
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
            className="flex gap-8 justify-center mt-14 flex-wrap">
            {[['12K+','Musicians'],['840+','Active Gigs'],['320+','Bands Formed'],['48','Cities']].map(([n,l]) => (
              <div key={l} className="text-center">
                <div className="font-head text-3xl font-extrabold">{n}</div>
                <div className="text-xs text-[var(--text3)] mt-1">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />

      {/* ── Features ── */}
      <section className="px-6 py-20">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-12">
            <div className="section-label">Why MusicConnect</div>
            <h2 className="font-head text-4xl font-extrabold">Everything musicians need</h2>
            <p className="text-[var(--text2)] mt-2">One platform for discovery, collaboration, and paid gigs.</p>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className="card card-hover p-7 cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                     style={{ background: f.color }}>{f.icon}</div>
                <h3 className="font-head text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text2)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 pb-20">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-12">
            <div className="section-label">Simple Process</div>
            <h2 className="font-head text-4xl font-extrabold">Get started in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.num} className="card p-7">
                <div className="font-head text-5xl font-extrabold text-[rgba(124,106,255,0.15)] leading-none mb-4">{s.num}</div>
                <h3 className="font-head text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text2)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Gigs ── */}
      {recentGigs.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-[1160px] mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <div>
                <div className="section-label">Live Opportunities</div>
                <h2 className="font-head text-3xl font-extrabold">Recent Gigs</h2>
              </div>
              <Link to="/gigs" className="btn-ghost text-sm">View All Gigs →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentGigs.map((g) => (
                <Link key={g.id} to="/gigs"
                  className="card card-hover p-5 block">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-head font-bold text-base leading-snug">{g.title}</h3>
                    <Badge variant="green">Open</Badge>
                  </div>
                  <p className="text-xs text-[var(--text2)] leading-relaxed mb-3 line-clamp-2">{g.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {g.required_roles.map(r => <Badge key={r}>{r}</Badge>)}
                    <Badge variant="cyan">📍 {g.city}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="font-head text-lg font-extrabold text-[var(--green)]">
                      {g.payment > 0 ? `₹${g.payment.toLocaleString()}` : 'Rev Share'}
                    </span>
                    <span className="text-xs text-[var(--text3)]">{g.applicant_count} applied</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Top Musicians ── */}
      {topMusicians.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-[1160px] mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <div>
                <div className="section-label">Top Talent</div>
                <h2 className="font-head text-3xl font-extrabold">Featured Musicians</h2>
              </div>
              <Link to="/discover" className="btn-ghost text-sm">See All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {topMusicians.map((m) => (
                <Link key={m.id} to="/discover"
                  className="card card-hover p-5 text-center block">
                  <Avatar name={m.name} size="md" className="mx-auto mb-3" />
                  <div className="font-head font-bold text-sm truncate">{m.name}</div>
                  <div className="text-xs text-[var(--text2)] mt-1">{m.role}</div>
                  <div className="mt-2"><Badge variant="gold">★ {m.rating || '4.8'}</Badge></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <div className="px-6 pb-20">
        <div className="max-w-[1160px] mx-auto">
          <div className="rounded-3xl p-14 text-center border border-[rgba(124,106,255,0.2)]"
               style={{ background: 'linear-gradient(135deg, rgba(124,106,255,0.12), rgba(34,211,238,0.06))' }}>
            <div className="section-label">Ready?</div>
            <h2 className="font-head text-4xl font-extrabold mb-3">Your next bandmate is waiting</h2>
            <p className="text-[var(--text2)] max-w-md mx-auto mb-8">
              Join 12,000+ musicians already connecting, collaborating, and performing across 48 cities.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl
              bg-accent text-white font-head font-bold text-lg
              hover:bg-[#6b59ee] hover:-translate-y-0.5 transition-all duration-200">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
