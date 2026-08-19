import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, onChange, min = 0, className = '' }) {
  return (
    <div
      className={`inline-flex items-center bg-surface-container-high rounded-full overflow-hidden border border-border-light ${className}`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant disabled:opacity-30 transition-colors"
      >
        <Minus size={16} />
      </button>
      <span className="text-label-md font-semibold w-8 text-center">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-surface-variant transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
