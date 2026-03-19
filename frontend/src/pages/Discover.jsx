import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, CardSkeleton, EmptyState, Chip, PageWrapper } from '../components/common'
import toast from 'react-hot-toast'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const GENRES = ['Rock','Blues','Jazz','Pop','Hip-Hop','Classical','Folk','Electronic','Metal','Funk','Reggae','R&B']
const CITIES = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Mysuru']
const ROLES  = ['Guitarist','Bassist','Drummer','Vocalist','Pianist','Producer','Violinist','Flutist']
const LEVELS = ['Beginner','Intermediate','Professional']

const EXP_BADGE    = { Beginner: 'cyan', Intermediate: 'gold', Professional: 'green' }
const AVAIL_BADGE  = { Available: 'green', Busy: 'red', 'Looking for band': 'purple' }

export default function Discover() {
  const { user } = useAuth()
  const [musicians, setMusicians] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [city,      setCity]      = useState('')
  const [role,      setRole]      = useState('')
  const [level,     setLevel]     = useState('')
  const [genres,    setGenres]    = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const fetchMusicians = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (city)   params.city       = city
      if (role)   params.role       = role
      if (level)  params.experience = level
      if (search) params.search     = search
      if (genres.size === 1) params.genre = [...genres][0]
      const { data } = await usersAPI.getAll(params)
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

  const hasActiveFilters = city || role || level || genres.size > 0

  const clearFilters = () => {
    setCity(''); setRole(''); setLevel(''); setGenres(new Set())
  }

  const handleConnect = (musician) => {
    if (!user) { toast.error('Please log in to connect'); return }
    toast.success(`Request sent to ${musician.name}!`)
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
  const item    = { hidden: { opacity:0, y:16 }, show: { opacity:1, y:0, transition: { duration:0.35 } } }

  return (
    <PageWrapper>
      <section className="px-3 sm:px-6 py-6 sm:py-10 max-w-[1160px] mx-auto">
        <div className="mb-6">
          <div className="section-label">Musician Network</div>
          <h1 className="font-head text-3xl sm:text-4xl font-extrabold">Discover Musicians</h1>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
            <input className="input pl-9" placeholder="Search by name or instrument…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-shrink-0
              ${showFilters || hasActiveFilters
                ? 'border-accent bg-[rgba(124,106,255,0.12)] text-[var(--accent3)]'
                : 'border-[var(--border2)] text-[var(--text2)] hover:border-accent'}`}>
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="card p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <select className="input" value={city} onChange={e => setCity(e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="">All Instruments</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">All Levels</option>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs text-[var(--text3)] mb-2 font-medium uppercase tracking-wider">Genres</div>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <Chip key={g} label={g} active={genres.has(g)} onClick={() => toggleGenre(g)} />
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 mt-3 text-xs text-[var(--red)] hover:underline">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        <div className="text-sm text-[var(--text3)] mb-4">
          {loading ? 'Loading…' : `${musicians.length} musician${musicians.length !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i) => <CardSkeleton key={i} />)}
          </div>
        ) : musicians.length === 0 ? (
          <EmptyState icon="🎸" title="No musicians found"
            description="Try adjusting your search or filters" />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {musicians.map(m => (
              <motion.div key={m.id} variants={item} className="card card-hover p-5 flex flex-col">
                <div className="flex gap-3 items-center mb-3">
                  <Avatar name={m.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-head font-bold text-base truncate">{m.name}</div>
                    <div className="text-xs text-[var(--text2)] mt-0.5">{m.role} · {m.city}</div>
                  </div>
                  <Badge variant={AVAIL_BADGE[m.availability] || 'green'} >
                    {m.availability === 'Available' ? '●' : '○'}
                  </Badge>
                </div>
                {m.bio && (
                  <p className="text-xs text-[var(--text2)] leading-relaxed mb-3 line-clamp-2">{m.bio}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {m.genres.slice(0,3).map(g => <Badge key={g}>{g}</Badge>)}
                  {m.genres.length > 3 && <Badge>+{m.genres.length - 3}</Badge>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto">
                  <div className="flex gap-2 text-xs text-[var(--text3)]">
                    <span>★ {m.rating || '—'}</span>
                    <span>🎤 {m.gigs_completed}</span>
                    <Badge variant={EXP_BADGE[m.experience] || 'cyan'}>{m.experience?.slice(0,3)}</Badge>
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
