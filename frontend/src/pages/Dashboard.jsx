import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { gigsAPI, usersAPI } from '../services/api'
import api from '../services/api'
import { Avatar, Badge, EmptyState, Modal, Field, PageWrapper } from '../components/common'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { LayoutDashboard, Mic2, FileText, Settings, Plus, ShieldCheck } from 'lucide-react'

const GENRES = ['Rock','Blues','Jazz','Pop','Hip-Hop','Classical','Folk','Electronic','Metal','Funk','Reggae','R&B']
const CITIES = ['Bangalore','Mumbai','Delhi','Chennai','Hyderabad','Pune','Kolkata','Mysuru']
const ROLES  = ['Guitarist','Bassist','Drummer','Vocalist','Pianist','Producer']

function StatCard({ label, value, color, change }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-[var(--text3)] font-semibold uppercase tracking-wider mb-3">{label}</div>
      <div className="font-head text-3xl font-extrabold" style={{ color }}>{value}</div>
      {change && <div className="text-xs text-[var(--green)] mt-1.5">{change}</div>}
    </div>
  )
}

function OverviewTab({ user, myGigs, applications }) {
  return (
    <div>
      <h2 className="font-head text-2xl font-extrabold mb-1">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
      <p className="text-sm text-[var(--text2)] mb-7">Here's what's happening with your music career.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Applications"  value={applications.length} color="var(--accent3)" change="Total applied" />
        <StatCard label="Posted Gigs"   value={myGigs.length}       color="var(--gold)"    change="Active listings" />
        <StatCard label="Profile Views" value={248}                 color="var(--cyan)"    change="This month" />
        <StatCard label="Rating"        value={user.rating || '—'}  color="var(--green)"   change={user.rating_count + ' reviews'} />
      </div>
      <div className="card p-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] font-head font-bold">Recent Activity</div>
        {[
          { dot: 'var(--green)',  text: applications[0] ? `You applied to "${applications[0].gig_title}"` : 'No applications yet — browse gigs!', time: '2 hours ago' },
          { dot: 'var(--accent)', text: 'A musician sent you a collaboration request', time: '5 hours ago' },
          { dot: 'var(--gold)',   text: myGigs[0] ? `Your gig "${myGigs[0].title}" is live` : 'Post your first gig to get started', time: '1 day ago' },
          { dot: 'var(--cyan)',   text: 'Someone viewed your profile', time: '1 day ago' },
          { dot: 'var(--pink)',   text: 'New gig match found in your city', time: '2 days ago' },
        ].map((a, i) => (
          <div key={i} className="flex gap-4 px-5 py-3.5 border-b border-[var(--border)] last:border-0">
            <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.dot }} />
            <div>
              <div className="text-sm text-[var(--text2)]">{a.text}</div>
              <div className="text-xs text-[var(--text3)] mt-0.5">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyGigsTab({ myGigs, onPostClick, onRefresh }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gig?')) return
    try {
      await gigsAPI.delete(id)
      toast.success('Gig deleted')
      onRefresh()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete')
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-head text-xl font-extrabold">My Posted Gigs</h2>
        <button className="btn-primary text-sm" onClick={onPostClick}><Plus size={14} /> Post Gig</button>
      </div>
      {myGigs.length === 0 ? (
        <EmptyState icon="🎤" title="No gigs posted yet" description="Post your first gig to start finding musicians"
          action={<button className="btn-primary" onClick={onPostClick}>Post a Gig</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Gig','City','Date','Applicants','Status',''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--text3)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myGigs.map(g => (
                <tr key={g.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-5 py-3.5 font-medium text-sm max-w-[200px] truncate">{g.title}</td>
                  <td className="px-5 py-3.5 text-sm text-[var(--text2)]">{g.city}</td>
                  <td className="px-5 py-3.5 text-sm text-[var(--text2)]">{format(new Date(g.date), 'd MMM')}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-accent text-white text-xs font-bold px-1.5">{g.applicant_count}</span>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant={g.status === 'open' ? 'green' : 'red'}>{g.status}</Badge></td>
                  <td className="px-5 py-3.5"><button className="btn-danger text-xs" onClick={() => handleDelete(g.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ApplicationsTab({ applications, onRefresh }) {
  const STATUS_VARIANT = { pending:'gold', accepted:'green', rejected:'red', cancelled:'red' }
  const handleCancel = async (gigId) => {
    try {
      await gigsAPI.cancelApply(gigId)
      toast.success('Application cancelled')
      onRefresh()
    } catch { toast.error('Failed to cancel') }
  }
  return (
    <div>
      <h2 className="font-head text-xl font-extrabold mb-6">My Applications</h2>
      {applications.length === 0 ? (
        <EmptyState icon="📋" title="No applications yet" description="Browse gigs and apply to start building your performance history"
          action={<Link to="/gigs" className="btn-primary">Browse Gigs</Link>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Gig','Role','Applied','Status',''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--text3)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map(a => (
                <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-5 py-3.5 font-medium text-sm max-w-[200px] truncate">{a.gig_title}</td>
                  <td className="px-5 py-3.5 text-sm text-[var(--text2)]">{a.applicant_role}</td>
                  <td className="px-5 py-3.5 text-sm text-[var(--text2)]">{format(new Date(a.applied_at), 'd MMM yyyy')}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[a.status] || 'gold'}>{a.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    {a.status === 'pending' && (
                      <button className="btn-danger text-xs" onClick={() => handleCancel(a.gig_id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SettingsTab({ user, onUpdate, logout }) {
  const [form, setForm] = useState({
    name:         user.name         || '',
    city:         user.city         || '',
    bio:          user.bio          || '',
    experience:   user.experience   || 'Beginner',
    availability: user.availability || 'Available',
    genres:       Array.isArray(user.genres) ? [...user.genres] : [],
    social_links: user.social_links || {},
  })
  const [saving, setSaving] = useState(false)
  const [newEmail,       setNewEmail]       = useState('')
  const [emailPassword,  setEmailPassword]  = useState('')
  const [savingEmail,    setSavingEmail]    = useState(false)
  const [currentPassword,setCurrentPassword]= useState('')
  const [newPassword,    setNewPassword]    = useState('')
  const [confirmPassword,setConfirmPassword]= useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    setForm({
      name:         user.name         || '',
      city:         user.city         || '',
      bio:          user.bio          || '',
      experience:   user.experience   || 'Beginner',
      availability: user.availability || 'Available',
      genres:       Array.isArray(user.genres) ? [...user.genres] : [],
      social_links: user.social_links || {},
    })
  }, [user.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(form)
      toast.success('Profile updated!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleChangeEmail = async () => {
    if (!newEmail || !emailPassword) { toast.error('Fill in all fields'); return }
    setSavingEmail(true)
    try {
      await usersAPI.changeEmail({ new_email: newEmail, password: emailPassword })
      toast.success('Email updated! Logging you out…')
      setNewEmail(''); setEmailPassword('')
      setTimeout(() => logout(), 1500)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update email')
    } finally { setSavingEmail(false) }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error('Fill in all fields'); return }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPassword(true)
    try {
      await usersAPI.changePassword({ current_password: currentPassword, new_password: newPassword })
      toast.success('Password updated successfully!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update password')
    } finally { setSavingPassword(false) }
  }

  const toggleGenre = (g) => {
    setForm(p => {
      const genres = Array.isArray(p.genres) ? p.genres : []
      return { ...p, genres: genres.includes(g) ? genres.filter(x => x !== g) : [...genres, g] }
    })
  }

  return (
    <div>
      <h2 className="font-head text-xl font-extrabold mb-6">Account Settings</h2>
      <div className="card p-6 mb-5">
        <h3 className="font-head font-bold text-base mb-4">Profile Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Display Name">
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="City">
            <select className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Experience">
            <select className="input" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}>
              <option>Beginner</option><option>Intermediate</option><option>Professional</option>
            </select>
          </Field>
          <Field label="Availability">
            <select className="input" value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}>
              <option>Available</option><option>Busy</option><option>Looking for band</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Bio">
              <textarea className="input" rows={3} value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
            </Field>
          </div>
        </div>
      </div>
      <div className="card p-6 mb-5">
        <h3 className="font-head font-bold text-base mb-4">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <button key={g} type="button" onClick={() => toggleGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                ${Array.isArray(form.genres) && form.genres.includes(g)
                  ? 'bg-[rgba(124,106,255,0.15)] border-accent text-[var(--accent3)]'
                  : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-accent'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-primary mb-8" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      <div className="card p-6">
        <h3 className="font-head font-bold text-base mb-6">Security</h3>
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-[var(--text2)] mb-1">Change Email</h4>
          <p className="text-xs text-[var(--text3)] mb-3">Current: <span className="text-[var(--text2)]">{user.email}</span></p>
          <div className="flex flex-col gap-3">
            <input className="input" type="email" placeholder="New email address"
              value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Confirm with your current password"
              value={emailPassword} onChange={e => setEmailPassword(e.target.value)} />
            <button className="btn-primary w-fit" onClick={handleChangeEmail} disabled={savingEmail}>
              {savingEmail ? 'Updating…' : 'Update Email'}
            </button>
          </div>
        </div>
        <div className="h-px bg-[var(--border)] mb-6" />
        <div>
          <h4 className="text-sm font-semibold text-[var(--text2)] mb-3">Change Password</h4>
          <div className="flex flex-col gap-3">
            <input className="input" type="password" placeholder="Current password"
              value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <input className="input" type="password" placeholder="New password (min. 6 characters)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input className="input" type="password" placeholder="Confirm new password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button className="btn-primary w-fit" onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminTab() {
  const [stats,   setStats]   = useState(null)
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data)
      } catch { toast.error('Failed to load admin data') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleBan = async (userId, isBanned) => {
    try {
      await api.patch(`/admin/users/${userId}/${isBanned ? 'unban' : 'ban'}`)
      toast.success(isBanned ? 'User unbanned' : 'User banned')
      setUsers(p => p.map(u => u.id === userId ? { ...u, is_active: isBanned } : u))
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
  }

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success(`${name} deleted`)
      setUsers(p => p.filter(u => u.id !== userId))
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
  }

  if (loading) return <div className="text-[var(--text3)] text-sm p-4">Loading admin data…</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[rgba(248,113,113,0.15)] flex items-center justify-center">
          <ShieldCheck size={16} className="text-[var(--red)]" />
        </div>
        <h2 className="font-head text-xl font-extrabold">Admin Panel</h2>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total Users',  value: stats.total_users,  color: 'var(--accent3)' },
            { label: 'Total Gigs',   value: stats.total_gigs,   color: 'var(--gold)' },
            { label: 'Active Gigs',  value: stats.active_gigs,  color: 'var(--green)' },
            { label: 'Applications', value: stats.total_apps,   color: 'var(--cyan)' },
            { label: 'Banned',       value: stats.banned_users, color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="font-head text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[var(--text3)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] font-head font-bold flex items-center justify-between">
          All Users
          <span className="text-xs font-normal text-[var(--text3)]">{users.length} total</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Name','Email','Role','City','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text3)] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-4 py-3 text-sm font-medium">
                  {u.name}
                  {u.is_admin && <span className="ml-2 badge badge-red" style={{fontSize:10}}>admin</span>}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--text2)]">{u.email}</td>
                <td className="px-4 py-3 text-xs text-[var(--text2)]">{u.role}</td>
                <td className="px-4 py-3 text-xs text-[var(--text2)]">{u.city}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.is_active ? 'green' : 'red'}>
                    {u.is_active ? 'Active' : 'Banned'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {!u.is_admin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBan(u.id, !u.is_active)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer
                          ${u.is_active
                            ? 'bg-[rgba(248,113,113,0.1)] text-[var(--red)] border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.2)]'
                            : 'bg-[rgba(52,211,153,0.1)] text-[var(--green)] border-[rgba(52,211,153,0.2)] hover:bg-[rgba(52,211,153,0.2)]'}`}>
                        {u.is_active ? 'Ban' : 'Unban'}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer
                          bg-[rgba(248,113,113,0.1)] text-[var(--red)] border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.2)]">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, refreshUser, logout } = useAuth()
  const [tab,          setTab]          = useState('overview')
  const [myGigs,       setMyGigs]       = useState([])
  const [applications, setApplications] = useState([])
  const [postOpen,     setPostOpen]     = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [postForm,     setPostForm]     = useState({
    title: '', description: '', city: 'Bangalore', date: '',
    payment: '', payment_type: 'Per Gig', required_roles: [],
  })

  // ← TABS is now INSIDE the component so it can access `user`
  const TABS = [
    { id: 'overview',     label: 'Overview',     icon: LayoutDashboard },
    { id: 'mygigs',       label: 'My Gigs',       icon: Mic2 },
    { id: 'applications', label: 'Applications',  icon: FileText },
    { id: 'settings',     label: 'Settings',      icon: Settings },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
  ]

  const loadData = async () => {
    if (!user) return
    try {
      const [gigsRes, appsRes] = await Promise.all([
        gigsAPI.getAll({ status: 'open' }),
        gigsAPI.myApplications(),
      ])
      setMyGigs(gigsRes.data.filter(g => g.created_by === user.id))
      setApplications(appsRes.data)
    } catch (e) {
      console.error('Dashboard load error:', e)
    }
  }

  useEffect(() => { loadData() }, [user])

  const handleUpdate = async (data) => {
    await usersAPI.updateMe(data)
    await refreshUser()
  }

  const togglePostRole = (r) => {
    setPostForm(p => ({
      ...p,
      required_roles: p.required_roles.includes(r)
        ? p.required_roles.filter(x => x !== r)
        : [...p.required_roles, r]
    }))
  }

  const submitGig = async () => {
    if (!postForm.title || !postForm.date || postForm.required_roles.length === 0) {
      toast.error('Fill title, date, and pick at least one role'); return
    }
    setSubmitting(true)
    try {
      await gigsAPI.create({
        title:          postForm.title,
        description:    postForm.description || 'Great opportunity for musicians.',
        city:           postForm.city,
        date:           new Date(postForm.date).toISOString(),
        required_roles: postForm.required_roles,
        payment:        parseFloat(postForm.payment) || 0,
        payment_type:   postForm.payment_type,
      })
      toast.success('Gig posted!')
      setPostOpen(false)
      setPostForm({ title:'', description:'', city:'Bangalore', date:'', payment:'', payment_type:'Per Gig', required_roles:[] })
      loadData()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to post gig')
    } finally { setSubmitting(false) }
  }

  return (
    <PageWrapper>
      <section className="px-6 py-10 max-w-[1160px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <div>
            <div className="card p-5 sticky top-24">
              <div className="text-center pb-5 mb-5 border-b border-[var(--border)]">
                <Avatar name={user?.name || ''} size="lg" className="mx-auto mb-3" />
                <div className="font-head font-bold text-base">{user?.name}</div>
                <div className="text-xs text-[var(--text2)] mt-1">{user?.role} · {user?.city}</div>
                <div className="mt-3">
                  <Badge variant={user?.availability === 'Available' ? 'green' : 'red'}>
                    {user?.availability || 'Available'}
                  </Badge>
                </div>
              </div>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all cursor-pointer
                    ${tab === t.id
                      ? 'bg-[rgba(124,106,255,0.12)] text-[var(--accent3)]'
                      : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'}`}>
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {tab === 'overview'     && <OverviewTab user={user} myGigs={myGigs} applications={applications} />}
              {tab === 'mygigs'       && <MyGigsTab myGigs={myGigs} onPostClick={() => setPostOpen(true)} onRefresh={loadData} />}
              {tab === 'applications' && <ApplicationsTab applications={applications} onRefresh={loadData} />}
              {tab === 'settings'     && user && <SettingsTab user={user} onUpdate={handleUpdate} logout={logout} />}
              {tab === 'admin'        && user?.is_admin && <AdminTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Modal open={postOpen} onClose={() => setPostOpen(false)} title="Post a Gig">
        <div className="flex flex-col gap-4">
          <Field label="Title *">
            <input className="input" value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className="input" rows={3} value={postForm.description}
              onChange={e => setPostForm(p => ({ ...p, description: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <select className="input" value={postForm.city} onChange={e => setPostForm(p => ({ ...p, city: e.target.value }))}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Date *">
              <input className="input" type="date" value={postForm.date}
                onChange={e => setPostForm(p => ({ ...p, date: e.target.value }))} />
            </Field>
            <Field label="Payment (₹)">
              <input className="input" type="number" value={postForm.payment}
                onChange={e => setPostForm(p => ({ ...p, payment: e.target.value }))} />
            </Field>
            <Field label="Pay Type">
              <select className="input" value={postForm.payment_type}
                onChange={e => setPostForm(p => ({ ...p, payment_type: e.target.value }))}>
                {['Per Gig','Per Hour','Per Event','Per Project','Rev Share','Volunteer'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Roles Needed *">
            <div className="flex flex-wrap gap-2 mt-1">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => togglePostRole(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer
                    ${postForm.required_roles.includes(r)
                      ? 'bg-[rgba(124,106,255,0.15)] border-accent text-[var(--accent3)]'
                      : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-accent'}`}>
                  {r}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-ghost" onClick={() => setPostOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submitGig} disabled={submitting}>
            {submitting ? 'Posting…' : 'Post Gig →'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
