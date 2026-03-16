import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// ─── Page Wrapper with fade-up animation ─────────────────────────────────────
export function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
const COLORS = [
  { bg: 'rgba(124,106,255,0.2)',  text: '#c4b5fd' },
  { bg: 'rgba(244,114,182,0.2)',  text: '#f472b6' },
  { bg: 'rgba(52,211,153,0.2)',   text: '#34d399' },
  { bg: 'rgba(34,211,238,0.2)',   text: '#22d3ee' },
  { bg: 'rgba(245,200,66,0.2)',   text: '#f5c842' },
  { bg: 'rgba(251,146,60,0.2)',   text: '#fb923c' },
  { bg: 'rgba(248,113,113,0.2)',  text: '#f87171' },
]

export function Avatar({ name = '', size = 'md', src, className = '' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const color = COLORS[name.charCodeAt(0) % COLORS.length]
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl' }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-head font-bold border-2 border-[var(--border2)] ${sizes[size]} ${className}`}
      style={{ background: color.bg, color: color.text }}
    >
      {initials}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{   scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`w-full ${maxWidth} bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-8 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-head text-xl font-bold">{title}</h2>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] transition-colors">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  purple: 'badge-purple', green: 'badge-green', gold: 'badge-gold',
  cyan: 'badge-cyan', pink: 'badge-pink', red: 'badge-red', orange: 'badge-orange',
}

export function Badge({ children, variant = 'purple' }) {
  return <span className={`badge ${badgeVariants[variant] || 'badge-purple'}`}>{children}</span>
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-4/5 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '🎸', title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="font-head text-lg font-bold text-[var(--text2)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--text3)] mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ label, title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
      <div>
        {label && <div className="section-label">{label}</div>}
        <h2 className="font-head text-3xl font-extrabold leading-tight">{title}</h2>
        {subtitle && <p className="text-[var(--text2)] mt-1.5 text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Input with label ─────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-[var(--text2)]">{label}</label>}
      {children}
      {error && <span className="text-xs text-[var(--red)]">{error}</span>}
    </div>
  )
}

// ─── Chip toggle ──────────────────────────────────────────────────────────────
export function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer
        ${active
          ? 'bg-[rgba(124,106,255,0.15)] border-accent text-[var(--accent3)]'
          : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent3)]'
        }`}
    >
      {label}
    </button>
  )
}
