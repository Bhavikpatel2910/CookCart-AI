import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  ...props
}) {
  const base =
    'bg-surface-container-lowest rounded-2xl shadow-card-soft'
  const hoverClass = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-medium cursor-pointer'
    : ''

  return (
    <motion.div
      className={`${base} ${hoverClass} ${padding ? 'p-stack-md' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
