import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { gigsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Badge, Modal, Field, EmptyState, CardSkeleton, PageWrapper } from '../components/common'
import toast from 'react-hot-toast'
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react'
import { format } from 'date-fns'

const CITIES   = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Mysuru']
const ROLES    = ['Guitarist','Bassist','Drummer','Vocalist','Pianist','Producer','Violinist']
const PAY_TYPES= ['Per Gig','Per Hour','Per Event','Per Project','Rev Share','Volunteer']

function GigCard({ gig, onApply, onCancel, currentUserId }) {
  const isOwner = gig.created_by === currentUserId
  const [detail, setDetail] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="card p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:border-[rgba(124,106,255,0.25)] hover:bg-[var(--surface2)]"
        onClick={() => setDetail(true)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-head font-bold text-base sm:text-lg leading-snug">{gig.title}</h3>
          <Badge variant={gig.status === 'open' ? 'green' : 'red'} >{gig.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[var(--text2)] mb-3">
          <span>📍 {gig.city}</span>
          <span>📅 {format(new Date(gig.date), 'd MMM yyyy')}</span>
          <span className="hidden sm:inline">👤 {gig.created_by_name}</span>
        </div>
        <p className="text-sm text-[var(--text2)] leading-relaxed mb-3 line-clamp-2">{gig.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {gig.required_roles.map(r => <Badge key={r}>{r}</Badge>)}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div>
            <span className="font-head text-lg sm:text-xl font-extrabold text-[var(--green)]">
              {gig.payment > 0 ? `₹${gig.payment.toLocaleString()}` : 'Rev Share'}
            </span>
            <span className="text-xs text-[var(--text3)] ml-1.5">{gig.payment_type}</span>
            <div className="text-xs text-[var(--text3)] mt-0.5">{gig.applicant_count} applied</div>
          </div>
          {!isOwner && gig.status === 'open' && (
            <button
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-all border cursor-pointer
                ${gig.has_applied
                  ? 'bg-[rgba(248,113,113,0.1)] text-[var(--red)] border-[rgba(248,113,113,0.2)]'
                  : 'bg-accent text-white border-transparent'}`}
              onClick={e => { e.stopPropagation(); gig.has_applied ? onCancel(gig) : onApply(gig) }}>
              {gig.has_applied ? '✕ Cancel' : '→ Apply'}
            </button>
          )}
          {isOwner && <Badge variant="cyan">Your gig</Badge>}
        </div>
      </motion.div>

      <Modal open={detail} onClose={() => setDetail(false)} title={gig.title} maxWidth="max-w-2xl">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={gig.status === 'open' ? 'green' : 'red'}>{gig.status}</Badge>
          <Badge variant="cyan">📍 {gig.city}</Badge>
          <Badge variant="gold">📅 {format(new Date(gig.date), 'd MMM yyyy')}</Badge>
        </div>
        <p className="text-sm text-[var(--text2)] leading-relaxed mb-5">{gig.description}</p>
        <div className="mb-4">
          <div className="text-xs text-[var(--text3)] uppercase tracking-wider mb-2">Roles Needed</div>
          <div className="flex flex-wrap gap-1.5">{gig.required_roles.map(r => <Badge key={r}>{r}</Badge>)}</div>
        </div>
        <div className="rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
             style={{ background: 'var(--bg3)' }}>
          <div>
            <div className="text-xs text-[var(--text3)] mb-1">Payment</div>
            <div className="font-head text-2xl sm:text-3xl font-extrabold text-[var(--green)]">
              {gig.payment > 0 ? `₹${gig.payment.toLocaleString()}` : 'Rev Share'}
            </div>
            <div className="text-xs text-[var(--text3)]">{gig.payment_type}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text3)] mb-1">Posted by</div>
            <div className="font-semibold text-sm">{gig.created_by_name}</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button className="btn-ghost w-full sm:w-auto" onClick={() => setDetail(false)}>Close</button>
          {!isOwner && gig.status === 'open' && (
            <button
              className={`w-full sm:w-auto ${gig.has_applied ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => { gig.has_applied ? onCancel(gig) : onApply(gig); setDetail(false) }}>
              {gig.has_applied ? '✕ Cancel Application' : '→ Apply to This Gig'}
            </button>
          )}
        </div>
      </Modal>
    </>
  )
}

export default function Gigs() {
  const { user } = useAuth()
  const [gigs,       setGigs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [postOpen,   setPostOpen]   = useState(false)
  const [applyOpen,  setApplyOpen]  = useState(false)
  const [activeGig,  setActiveGig]  = useState(null)
  const [applyMsg,   setApplyMsg]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title:'', description:'', city:'Bangalore', date:'', payment:'', payment_type:'Per Gig', required_roles: new Set()
  })

  const fetchGigs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { status: 'open' }
      if (cityFilter) params.city = cityFilter
      if (roleFilter) params.role = roleFilter
      if (search)     params.search = search
      const { data } = await gigsAPI.getAll(params)
      setGigs(data)
    } catch { toast.error('Failed to load gigs') }
    finally  { setLoading(false) }
  }, [cityFilter, roleFilter, search])

  useEffect(() => { fetchGigs() }, [fetchGigs])

  const handleApply = (gig) => {
    if (!user) { toast.error('Please log in to apply'); return }
    setActiveGig(gig); setApplyMsg(''); setApplyOpen(true)
  }

  const submitApply = async () => {
    if (!activeGig) return
    setSubmitting(true)
    try {
      await gigsAPI.apply(activeGig.id, { message: applyMsg })
      toast.success(`Applied to "${activeGig.title}"!`)
      setApplyOpen(false); fetchGigs()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to apply') }
    finally { setSubmitting(false) }
  }

  const handleCancel = async (gig) => {
    if (!user) return
    try {
      await gigsAPI.cancelApply(gig.id)
      toast.success('Application cancelled'); fetchGigs()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to cancel') }
  }

  const toggleRole = (r) => setForm(p => {
    const roles = new Set(p.required_roles)
    roles.has(r) ? roles.delete(r) : roles.add(r)
    return { ...p, required_roles: roles }
  })

  const submitGig = async () => {
    if (!form.title.trim() || !form.date || form.required_roles.size === 0) {
      toast.error('Please fill title, date, and select at least one role'); return
    }
    setSubmitting(true)
    try {
      await gigsAPI.create({
        title:          form.title,
        description:    form.description || 'Great opportunity for musicians.',
        city:           form.city,
        date:           new Date(form.date).toISOString(),
        required_roles: [...form.required_roles],
        payment:        parseFloat(form.payment) || 0,
        payment_type:   form.payment_type,
      })
      toast.success('Gig posted!')
      setPostOpen(false)
      setForm({ title:'', description:'', city:'Bangalore', date:'', payment:'', payment_type:'Per Gig', required_roles: new Set() })
      fetchGigs()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to post gig') }
    finally { setSubmitting(false) }
  }

  const hasFilters = cityFilter || roleFilter

  return (
    <PageWrapper>
      <section className="px-3 sm:px-6 py-6 sm:py-10 max-w-[1160px] mx-auto">
        <div className="mb-5">
          <div className="section-label">Gig Marketplace</div>
          <h1 className="font-head text-3xl sm:text-4xl font-extrabold">Find Your Next Gig</h1>
        </div>

        {/* Post banner */}
        <div className="rounded-2xl p-5 sm:p-7 mb-6 border border-[rgba(124,106,255,0.2)]"
             style={{ background: 'linear-gradient(135deg, rgba(124,106,255,0.12), rgba(34,211,238,0.06))' }}>
          <h3 className="font-head text-lg sm:text-2xl font-extrabold mb-1 sm:mb-2">Got a gig to fill? 🎶</h3>
          <p className="text-sm text-[var(--text2)] mb-4">Post your opportunity and reach hundreds of local musicians instantly.</p>
          <button className="btn-primary w-full sm:w-auto" onClick={() => {
            if (!user) { toast.error('Please log in to post a gig'); return }
            setPostOpen(true)
          }}>
            <Plus size={16} /> Post a Gig
          </button>
        </div>

        {/* Search + filter row */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
            <input className="input pl-9" placeholder="Search gigs…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-shrink-0
              ${showFilters || hasFilters
                ? 'border-accent bg-[rgba(124,106,255,0.12)] text-[var(--accent3)]'
                : 'border-[var(--border2)] text-[var(--text2)] hover:border-accent'}`}>
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filter</span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
        </div>

        {showFilters && (
          <div className="card p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="input" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button onClick={() => { setCityFilter(''); setRoleFilter('') }}
                className="flex items-center gap-1.5 mt-3 text-xs text-[var(--red)] hover:underline">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}

        <div className="text-sm text-[var(--text3)] mb-4">
          {loading ? 'Loading…' : `${gigs.length} gig${gigs.length !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">{Array.from({length:4}).map((_,i) => <CardSkeleton key={i} />)}</div>
        ) : gigs.length === 0 ? (
          <EmptyState icon="🎤" title="No gigs found" description="Try different filters or be the first to post one" />
        ) : (
          <div className="flex flex-col gap-4">
            {gigs.map(g => (
              <GigCard key={g.id} gig={g} onApply={handleApply} onCancel={handleCancel} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </section>

      {/* Apply Modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply — ${activeGig?.title}`}>
        <div className="mb-4 p-4 rounded-xl bg-[var(--bg3)] text-sm text-[var(--text2)]">
          <div className="flex flex-wrap gap-3">
            <span>📍 {activeGig?.city}</span>
            <span>💰 {activeGig?.payment > 0 ? `₹${activeGig?.payment?.toLocaleString()}` : 'Rev Share'}</span>
          </div>
        </div>
        <Field label="Message (optional)">
          <textarea className="input" rows={4}
            placeholder="Introduce yourself, your relevant experience…"
            value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
        </Field>
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
          <button className="btn-ghost w-full sm:w-auto" onClick={() => setApplyOpen(false)}>Cancel</button>
          <button className="btn-primary w-full sm:w-auto" onClick={submitApply} disabled={submitting}>
            {submitting ? 'Sending…' : '→ Submit Application'}
          </button>
        </div>
      </Modal>

      {/* Post Gig Modal */}
      <Modal open={postOpen} onClose={() => setPostOpen(false)} title="Post a Gig">
        <div className="flex flex-col gap-4">
          <Field label="Gig Title *">
            <input className="input" placeholder="e.g. Drummer needed for jazz night"
              value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
          </Field>
          <Field label="Description">
            <textarea className="input" rows={3} placeholder="Tell musicians about the gig…"
              value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="City">
              <select className="input" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Date *">
              <input className="input" type="date" value={form.date}
                onChange={e => setForm(p => ({...p, date: e.target.value}))} />
            </Field>
            <Field label="Payment (₹)">
              <input className="input" type="number" placeholder="5000"
                value={form.payment} onChange={e => setForm(p => ({...p, payment: e.target.value}))} />
            </Field>
            <Field label="Payment Type">
              <select className="input" value={form.payment_type}
                onChange={e => setForm(p => ({...p, payment_type: e.target.value}))}>
                {PAY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Roles Needed *">
            <div className="flex flex-wrap gap-2 mt-1">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => toggleRole(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                    ${form.required_roles.has(r)
                      ? 'bg-[rgba(124,106,255,0.15)] border-accent text-[var(--accent3)]'
                      : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-accent'}`}>
                  {r}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
          <button className="btn-ghost w-full sm:w-auto" onClick={() => setPostOpen(false)}>Cancel</button>
          <button className="btn-primary w-full sm:w-auto" onClick={submitGig} disabled={submitting}>
            {submitting ? 'Posting…' : 'Post Gig →'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
