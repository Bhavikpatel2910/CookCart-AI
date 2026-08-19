import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'
import { DELIVERY } from '../../utils/mockData.js'

export default function TrackingMap({ className = '' }) {
  const route = '28.6100,77.2090'

  return (
    <div
      className={`relative w-full h-[400px] md:rounded-2xl overflow-hidden shadow-sm bg-surface-container-low ${className}`}
    >
      {/* Simulated map surface */}
      <div className="absolute inset-0 opacity-[0.5]">
        <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="400" fill="#EAF4E8" />
          <g stroke="#D8E5D5" strokeWidth="10">
            <path d="M0 120 H400 M0 260 H400 M0 340 H400" />
            <path d="M100 0 V400 M230 0 V400 M320 0 V400" />
          </g>
          <g stroke="#ffffff" strokeWidth="14">
            <path d="M0 80 H400 M0 210 H400 M0 300 H400 M50 0 V400 M180 0 V400 M290 0 V400" />
          </g>
          <g fill="#CFE6CA">
            <rect x="300" y="120" width="60" height="50" rx="6" />
            <rect x="30" y="20" width="70" height="40" rx="6" />
          </g>
          <g fill="#B9D8B2">
            <circle cx="330" cy="330" r="18" />
            <circle cx="60" cy="240" r="14" />
          </g>
        </svg>
      </div>

      {/* Route line */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <path
          d="M310 330 Q 210 300, 160 200 T 120 60"
          fill="none"
          stroke="#14C15A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="10 8"
        />
      </svg>

      {/* Origin: store */}
      <motion.div
        className="absolute"
        style={{ left: '76%', top: '80%' }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="relative flex w-10 h-10 items-center justify-center">
          <span className="absolute inline-flex w-full h-full rounded-full bg-success-veg/40 animate-ping" />
          <span className="relative w-8 h-8 rounded-full bg-success-veg text-white flex items-center justify-center shadow-lg">
            <Navigation size={16} />
          </span>
        </span>
      </motion.div>

      {/* Destination */}
      <div className="absolute left-[24%] top-[14%]">
        <span className="relative flex w-6 h-6 items-center justify-center">
          <span className="absolute inline-flex w-full h-full rounded-full bg-warning/40 animate-ping" />
          <span className="relative w-5 h-5 rounded-full bg-warning flex items-center justify-center shadow">
            <MapPin size={12} className="text-white" />
          </span>
        </span>
      </div>

      <div className="absolute top-6 left-6 bg-surface shadow-md rounded-full px-4 py-2 flex items-center gap-2 border border-border-light">
        <MapPin size={16} className="text-success-veg" />
        <span className="text-label-sm text-on-surface font-semibold">
          {DELIVERY.storeName}
        </span>
      </div>
      <div className="absolute bottom-6 right-6 bg-surface/90 backdrop-blur rounded-full px-4 py-2 border border-border-light shadow-sm">
        <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
          <Navigation size={14} className="text-success-veg" />
          {route} · {DELIVERY.route}
        </span>
      </div>
    </div>
  )
}
