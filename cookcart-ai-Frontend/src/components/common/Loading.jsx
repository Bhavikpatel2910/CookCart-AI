import { motion } from 'framer-motion'

export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

export default function Loading({
  label = 'Warming up the kitchen…',
  fullPage = false,
}) {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-success-veg/20 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-success-veg border-t-transparent animate-spin" />
        </div>
        <p className="text-label-md text-on-surface-variant animate-pulse">{label}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-gutter"
    >
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="space-y-3">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </motion.div>
  )
}
