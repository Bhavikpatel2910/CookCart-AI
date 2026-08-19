export default function Chip({
  children,
  active = false,
  onClick,
  dotClass,
  className = '',
}) {
  const base = active
    ? 'bg-success-veg text-on-primary shadow-sm'
    : 'bg-surface-container-lowest border border-border-light text-on-surface hover:bg-surface-container-low'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full text-label-md transition-colors duration-200 ${base} ${className}`}
    >
      {dotClass ? <span className={`w-2 h-2 rounded-full ${dotClass}`} /> : null}
      {children}
    </button>
  )
}
