const TONES = {
  green: 'bg-success-veg/10 text-success-veg',
  white: 'bg-white/90 backdrop-blur-sm text-on-surface',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/10 text-error',
  dark: 'bg-brand-dark/90 text-white',
  primary: 'bg-primary text-on-primary',
  soft: 'bg-surface-soft text-secondary',
}

export default function Badge({ children, tone = 'green', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium shadow-sm ${TONES[tone]} ${className}`}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </span>
  )
}

export function VegBadge({ isVeg = true, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-label-sm bg-white/90 backdrop-blur-sm shadow-sm ${className}`}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${isVeg ? 'bg-success-veg' : 'bg-error'}`}
      />
      <span className="text-on-surface">{isVeg ? 'Veg' : 'Non-Veg'}</span>
    </span>
  )
}

export function DotBadge({ children, dotClass = 'bg-success-veg', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm shadow-sm ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      {children}
    </span>
  )
}
