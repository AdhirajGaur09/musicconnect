import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, CardSkeleton, EmptyState, Chip, PageWrapper } from '../components/common'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

const GENRES = ['Rock','Blues','Jazz','Pop','Hip-Hop','Classical','Folk','Electronic','Metal','Funk','Reggae','R&B']
const CITIES = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Mysuru']
const ROLES  = ['Guitarist','Bassist','Drummer','Vocalist','Pianist','Producer','Violinist','Flutist']
const LEVELS = ['Beginner','Intermediate','Professional']

const EXP_BADGE = { Beginner: 'cyan', Intermediate: 'gold', Professional: 'green' }
const AVAIL_BADGE = { Available: 'green', Busy: 'red', 'Looking for band': 'purple' }

export default function Discover() {
  const { user } = useAuth()
  const [musicians, setMusicians]     = useState([])
  const [loading,   setLoading]       = useState(true)
  const [search,    setSearch]        = useState('')
  const [city,      setCity]          = useState('')
  const [role,      setRole]          = useState('')
  const [level,     setLevel]         = useState('')
  const [genres,    setGenres]        = useState(new Set())

  const fetchMusicians = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (city)   params.city       = city
      if (role)   params.role       = role
      if (level)  params.experience = level
      if (search) params.search     = search
      if (genres.size === 1) params.genre = [...genres][0]  // API supports single genre filter
      const { data } = await usersAPI.getAll(params)
      // client-side multi-genre filter
      const filtered = genres.size > 0
        ? data.filter(m => m.genres.some(g => genres.has(g)))
        : data
      setMusicians(filtered)
    } catch {
      toast.error('Failed to load musicians')
    } finally {
      setLoading(false)
    }
  }, [city, role, level, search, genres])

  useEffect(() => { fetchMusicians() }, [fetchMusicians])

  const toggleGenre = (g) => {
    setGenres(prev => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }

  const handleConnect = (musician) => {
    if (!user) { toast.error('Please log in to connect'); return }
    toast.success(`Request sent to ${musician.name}!`)
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
  const item    = { hidden: { opacity:0, y:16 }, show: { opacity:1, y:0, transition: { duration:0.35 } } }

  return (
    <PageWrapper>
      <section className="px-6 py-10 max-w-[1160px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="section-label">Musician Network</div>
          <h1 className="font-head text-4xl font-extrabold">Discover Musicians</h1>
        </div>

        {/* Filters */}
        <div className="card p-5 mb-6">
          <div className="flex gap-3 flex-wrap mb-4">
            <div className="relative flex-[2] min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
              <input className="input pl-9" placeholder="Search by name or instrument…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input flex-1 min-w-[130px]" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input flex-1 min-w-[130px]" value={role} onChange={e => setRole(e.target.value)}>
              <option value="">All Instruments</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="input flex-1 min-w-[130px]" value={level} onChange={e => setLevel(e.target.value)}>
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          {/* Genre chips */}
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <Chip key={g} label={g} active={genres.has(g)} onClick={() => toggleGenre(g)} />
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="text-sm text-[var(--text3)] mb-5">
          {loading ? 'Loading…' : `Showing ${musicians.length} musician${musicians.length !== 1 ? 's' : ''}`}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({length:6}).map((_,i) => <CardSkeleton key={i} />)}
          </div>
        ) : musicians.length === 0 ? (
          <EmptyState icon="🎸" title="No musicians found"
            description="Try adjusting your search or filters" />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {musicians.map(m => (
              <motion.div key={m.id} variants={item}
                className="card card-hover p-6 flex flex-col">
                <div className="flex gap-4 items-center mb-4">
                  <Avatar name={m.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-head font-bold text-base truncate">{m.name}</div>
                    <div className="text-xs text-[var(--text2)] mt-0.5">{m.role} · {m.city}</div>
                  </div>
                  <Badge variant={AVAIL_BADGE[m.availability] || 'green'}>
                    {m.availability === 'Available' ? '● Available' : m.availability}
                  </Badge>
                </div>

                {m.bio && (
                  <p className="text-xs text-[var(--text2)] leading-relaxed mb-4 line-clamp-2">{m.bio}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {m.genres.slice(0,3).map(g => <Badge key={g}>{g}</Badge>)}
                  {m.genres.length > 3 && <Badge>+{m.genres.length - 3}</Badge>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                  <div className="flex gap-3 text-xs text-[var(--text3)]">
                    <span>★ {m.rating || '—'}</span>
                    <span>🎤 {m.gigs_completed}</span>
                    <Badge variant={EXP_BADGE[m.experience] || 'cyan'}>{m.experience}</Badge>
                  </div>
                  <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleConnect(m)}>
                    Connect
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </PageWrapper>
  )
}
