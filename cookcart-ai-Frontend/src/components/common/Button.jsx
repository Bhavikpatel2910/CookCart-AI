import { motion } from 'framer-motion'

const VARIANTS = {
  primary:
    'btn-gradient text-on-primary shadow-glow-green hover:shadow-glow-green-lg',
  secondary:
    'bg-surface-container-lowest text-on-surface border-[1.5px] border-on-surface hover:bg-surface-container-low',
  ghost:
    'bg-transparent text-success-veg hover:bg-success-veg/10',
  dark:
    'bg-brand-dark text-white hover:bg-brand-dark/90 shadow-lg',
  soft:
    'bg-surface-soft text-secondary hover:bg-success-veg hover:text-white',
  outline:
    'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low',
}

const SIZES = {
  sm: 'px-4 py-2 text-label-sm',
  md: 'px-6 py-3 text-label-md',
  lg: 'px-8 py-4 text-label-md',
  xl: 'px-8 py-4 text-body-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center justify-center gap-2 rounded-[16px] font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-success-veg/50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' ? <Icon size={18} /> : null}
      {children}
      {Icon && iconPosition === 'right' ? <Icon size={18} /> : null}
    </motion.button>
  )
}
