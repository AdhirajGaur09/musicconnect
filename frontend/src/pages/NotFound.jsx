import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center"
         style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className="font-head text-[120px] font-extrabold text-[rgba(124,106,255,0.15)] leading-none mb-4">
          404
        </div>
        <h1 className="font-head text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-[var(--text2)] mb-8">Looks like this page went on tour and never came back.</p>
        <Link to="/" className="btn-primary inline-flex">← Back to Home</Link>
      </motion.div>
    </div>
  )
}
