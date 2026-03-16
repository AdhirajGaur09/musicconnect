import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Music2, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-[var(--accent3)] bg-[rgba(124,106,255,0.12)]'
        : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)]"
         style={{ background: 'rgba(8,10,16,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-[1160px] mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-head font-extrabold text-xl">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Music2 size={16} className="text-white" />
          </div>
          <span>MusicConnect</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/"        end className={navLinkClass}>Home</NavLink>
          <NavLink to="/discover"    className={navLinkClass}>Discover</NavLink>
          <NavLink to="/gigs"        className={navLinkClass}>Gigs</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                border border-[var(--border2)] hover:border-accent transition-colors duration-200">
                <div className="w-6 h-6 rounded-full bg-[rgba(124,106,255,0.25)] flex items-center
                  justify-center text-[var(--accent3)] text-xs font-head font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[var(--text2)] hidden sm:block max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>
              <button onClick={handleLogout}
                className="w-9 h-9 rounded-xl border border-[var(--border2)] flex items-center justify-center
                  text-[var(--text2)] hover:text-[var(--red)] hover:border-[rgba(248,113,113,0.3)]
                  transition-all duration-200">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm px-4 py-2">Log In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Join Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
