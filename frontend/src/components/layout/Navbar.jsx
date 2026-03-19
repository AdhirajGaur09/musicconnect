import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { Music2, LogOut, User, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-[var(--accent3)] bg-[rgba(124,106,255,0.12)]'
        : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
    }`

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-[var(--accent3)] bg-[rgba(124,106,255,0.12)]'
        : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)]"
         style={{ background: 'rgba(8,10,16,0.92)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-head font-extrabold text-lg sm:text-xl flex-shrink-0"
              onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Music2 size={16} className="text-white" />
          </div>
          <span>MusicConnect</span>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/"         end className={navLinkClass}>Home</NavLink>
          <NavLink to="/discover"     className={navLinkClass}>Discover</NavLink>
          <NavLink to="/gigs"         className={navLinkClass}>Gigs</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border2)] hover:border-accent transition-colors duration-200">
                <div className="w-6 h-6 rounded-full bg-[rgba(124,106,255,0.25)] flex items-center justify-center text-[var(--accent3)] text-xs font-head font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[var(--text2)] max-w-[100px] truncate">{user.name}</span>
              </Link>
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl border border-[var(--border2)] flex items-center justify-center
                text-[var(--text2)] hover:text-[var(--text)] hover:border-accent transition-all duration-200">
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={handleLogout}
                className="w-9 h-9 rounded-xl border border-[var(--border2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--red)] hover:border-[rgba(248,113,113,0.3)] transition-all duration-200">
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

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="w-8 h-8 rounded-full bg-[rgba(124,106,255,0.25)] flex items-center justify-center text-[var(--accent3)] text-sm font-head font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-xl border border-[var(--border2)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] transition-all duration-200">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-3 space-y-1"
             style={{ background: 'rgba(8,10,16,0.97)' }}>
          <NavLink to="/"         end className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/discover"     className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>🎸 Discover</NavLink>
          <NavLink to="/gigs"         className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>🎤 Gigs</NavLink>
          {user && <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>📊 Dashboard</NavLink>}
          {user && <NavLink to="/profile"   className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>👤 Profile</NavLink>}

          <div className="pt-2 border-t border-[var(--border)] mt-2">
            {user ? (
              <div>
                <div className="px-4 py-2 text-xs text-[var(--text3)]">Logged in as <span className="text-[var(--accent3)]">{user.name}</span></div>
                <button onClick={toggleTheme}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium
                    text-[var(--text2)] hover:bg-[var(--surface)] transition-all duration-200">
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--red)] hover:bg-[rgba(248,113,113,0.08)] transition-all duration-200">
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login"    className="btn-ghost text-sm py-3 justify-center" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn-primary text-sm py-3 justify-center" onClick={() => setMenuOpen(false)}>Join Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
