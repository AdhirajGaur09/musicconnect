import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usersAPI, gigsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge, Modal, Field, PageWrapper, CardSkeleton } from '../components/common'
import toast from 'react-hot-toast'
import { ExternalLink, Edit2, Star, Music, MapPin, Briefcase } from 'lucide-react'

const GENRES = ['Rock','Blues','Jazz','Pop','Hip-Hop','Classical','Folk','Electronic','Metal','Funk','Reggae','R&B']
const CITIES = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Mysuru']

export default function Profile() {
  const { id }   = useParams()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const profileId   = id || user?.id
  const isOwnProfile = !id || id === user?.id

  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form,     setForm]     = useState({})
  const [saving,   setSaving]   = useState(false)
  const [myPosted, setMyPosted] = useState([])

  useEffect(() => {
    if (!profileId) { navigate('/login'); return }
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await usersAPI.getById(profileId)
        setProfile(data)
        setForm({
          name:         data.name,
          bio:          data.bio || '',
          city:         data.city,
          experience:   data.experience,
          availability: data.availability,
          genres:       new Set(data.genres),
          social_links: data.social_links || {},
        })
        if (isOwnProfile) {
          const gigsRes = await gigsAPI.getAll({ status: 'open' })
          setMyPosted(gigsRes.data.filter(g => g.created_by === data.id).slice(0, 3))
        }
      } catch { toast.error('User not found') }
      finally  { setLoading(false) }
    }
    load()
  }, [profileId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await usersAPI.updateMe({ ...form, genres: [...form.genres] })
      await refreshUser()
      const { data } = await usersAPI.getById(profileId)
      setProfile(data)
      setEditOpen(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const toggleGenre = (g) => setForm(p => {
    const gs = new Set(p.genres); gs.has(g) ? gs.delete(g) : gs.add(g)
    return { ...p, genres: gs }
  })

  const EXP_BADGE = { Beginner:'cyan', Intermediate:'gold', Professional:'green' }
  const AVAIL_BADGE = { Available:'green', Busy:'red', 'Looking for band':'purple' }

  if (loading) return (
    <div className="px-6 py-10 max-w-[1160px] mx-auto">
      <div className="card p-8 mb-6"><CardSkeleton /></div>
    </div>
  )

  if (!profile) return (
    <div className="text-center py-20 text-[var(--text3)]">User not found</div>
  )

  return (
    <PageWrapper>
      <section className="px-6 py-10 max-w-[1160px] mx-auto">

        {/* Header Card */}
        <div className="card p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(ellipse 100% 200% at 80% 50%, rgba(124,106,255,0.07), transparent 60%)' }} />
          <div className="relative flex gap-6 flex-wrap">
            <Avatar name={profile.name} size="xl" />
            <div className="flex-1 min-w-[220px]">
              <h1 className="font-head text-3xl font-extrabold">{profile.name}</h1>
              <p className="text-[var(--text2)] mt-1">
                🎸 {profile.role} · {profile.city}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge>{profile.role}</Badge>
                <Badge variant={AVAIL_BADGE[profile.availability] || 'green'}>{profile.availability}</Badge>
                <Badge variant={EXP_BADGE[profile.experience] || 'cyan'}>{profile.experience}</Badge>
                {profile.genres.slice(0,3).map(g => <Badge key={g} variant="purple">{g}</Badge>)}
              </div>
              {/* Stats */}
              <div className="flex gap-6 mt-6 flex-wrap">
                {[
                  ['Gigs', profile.gigs_completed],
                  ['Rating', profile.rating_count > 0 ? `${profile.rating}★` : '—'],
                  ['Reviews', profile.rating_count],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="font-head text-2xl font-extrabold">{val}</div>
                    <div className="text-xs text-[var(--text3)] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="flex gap-3 mt-6 flex-wrap">
                {isOwnProfile ? (
                  <button className="btn-primary" onClick={() => setEditOpen(true)}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => toast.success(`Message sent to ${profile.name}!`)}>
                      Message
                    </button>
                    <button className="btn-ghost" onClick={() => toast.success('Connection request sent!')}>
                      Connect
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two column */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-5">
            {/* Bio */}
            {profile.bio && (
              <div className="card p-6">
                <h3 className="font-head font-bold text-base mb-3 flex items-center gap-2">
                  <Music size={16} className="text-[var(--accent)]" /> About
                </h3>
                <p className="text-sm text-[var(--text2)] leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Genres */}
            {profile.genres.length > 0 && (
              <div className="card p-6">
                <h3 className="font-head font-bold text-base mb-3">🎼 Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map(g => <Badge key={g}>{g}</Badge>)}
                </div>
              </div>
            )}

            {/* My Gigs */}
            {isOwnProfile && myPosted.length > 0 && (
              <div className="card p-6">
                <h3 className="font-head font-bold text-base mb-4">🎤 My Active Gigs</h3>
                <div className="space-y-3">
                  {myPosted.map(g => (
                    <div key={g.id} className="p-3.5 rounded-xl bg-[var(--bg3)]">
                      <div className="font-semibold text-sm mb-1">{g.title}</div>
                      <div className="text-xs text-[var(--text3)]">{g.city} · {g.applicant_count} applicants</div>
                      <div className="text-[var(--green)] text-sm font-bold mt-1.5">
                        {g.payment > 0 ? `₹${g.payment.toLocaleString()}` : 'Rev Share'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {/* Details */}
            <div className="card p-6">
              <h3 className="font-head font-bold text-base mb-4">📍 Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-[var(--text2)]">
                  <MapPin size={14} className="text-[var(--accent)]" />
                  {profile.city}
                </div>
                <div className="flex items-center gap-3 text-[var(--text2)]">
                  <Briefcase size={14} className="text-[var(--accent)]" />
                  {profile.experience}
                </div>
                <div className="flex items-center gap-3 text-[var(--text2)]">
                  <Star size={14} className="text-[var(--gold)]" />
                  {profile.rating > 0 ? `${profile.rating} / 5.0` : 'No ratings yet'}
                </div>
              </div>
            </div>

            {/* Social links */}
            {Object.keys(profile.social_links || {}).length > 0 && (
              <div className="card p-6">
                <h3 className="font-head font-bold text-base mb-4">🔗 Links</h3>
                <div className="space-y-2">
                  {Object.entries(profile.social_links).map(([platform, url]) => (
                    url && (
                      <a key={platform} href={url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg3)] border border-[var(--border)]
                          text-sm text-[var(--text2)] hover:border-accent hover:text-[var(--accent3)] transition-colors">
                        <ExternalLink size={13} />
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Profile views */}
            {isOwnProfile && (
              <div className="card p-6 text-center">
                <div className="text-xs text-[var(--text3)] uppercase tracking-wider mb-2">Profile Views</div>
                <div className="font-head text-4xl font-extrabold text-[var(--accent3)]">248</div>
                <div className="text-xs text-[var(--text3)] mt-1">this month</div>
                <div className="text-[var(--green)] text-xs mt-2">↑ 32% vs last month</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="flex flex-col gap-4">
          <Field label="Display Name">
            <input className="input" value={form.name || ''} onChange={e => setForm(p=>({...p,name:e.target.value}))} />
          </Field>
          <Field label="Bio">
            <textarea className="input" rows={3} value={form.bio || ''}
              onChange={e => setForm(p=>({...p,bio:e.target.value}))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <select className="input" value={form.city||''} onChange={e => setForm(p=>({...p,city:e.target.value}))}>
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Availability">
              <select className="input" value={form.availability||''} onChange={e => setForm(p=>({...p,availability:e.target.value}))}>
                <option>Available</option><option>Busy</option><option>Looking for band</option>
              </select>
            </Field>
          </div>
          <Field label="Genres">
            <div className="flex flex-wrap gap-2 mt-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                    ${form.genres?.has(g) ? 'bg-[rgba(124,106,255,0.15)] border-accent text-[var(--accent3)]' : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-accent'}`}>
                  {g}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Social Links">
            <div className="grid grid-cols-1 gap-2 mt-1">
              {['spotify','youtube','instagram','soundcloud'].map(platform => (
                <input key={platform} className="input" placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                  value={form.social_links?.[platform] || ''}
                  onChange={e => setForm(p => ({ ...p, social_links: { ...p.social_links, [platform]: e.target.value } }))} />
              ))}
            </div>
          </Field>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
