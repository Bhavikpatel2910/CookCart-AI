import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import QuantityStepper from '../common/QuantityStepper.jsx'
import SmartImage from '../common/SmartImage.jsx'
import { formatCurrency } from '../../utils/helpers.js'

export default function CartItem({ item, onUpdate, onRemove, onTogglePantry }) {
  const isPantry = item.fromPantry
  const skuId = item.skuId ?? item.id
  const lineTotal = (item.price || 0) * (item.quantity || 1)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className={`bg-surface-container-lowest rounded-xl shadow-card-soft p-4 flex items-center gap-4 transition-colors ${isPantry ? 'opacity-80' : ''}`}
    >
      <div
        className={`w-16 h-16 rounded-lg ${item.bg ?? 'bg-surface-container-low'} overflow-hidden flex-shrink-0 relative`}
      >
        <SmartImage src={item.image} alt={item.name} kind="product" className="w-full h-full object-cover" />
        {isPantry && (
          <span className="absolute inset-0 bg-surface-container-lowest/50 flex items-center justify-center">
            <span className="bg-success-veg text-white rounded-full p-1 shadow">
              <Check size={12} strokeWidth={3} />
            </span>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-label-md text-on-surface font-semibold truncate">
            {item.name}
          </p>
          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => onRemove(skuId)}
            className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-label-sm text-on-surface-variant mt-0.5">
          {item.packSize ?? '1 item'}
        </p>
        <div className="flex items-center justify-between mt-2 gap-3">
          <QuantityStepper
            value={item.quantity}
            min={1}
            onChange={(next) => onUpdate(skuId, next - item.quantity)}
          />
          <div className="text-right">
            <p className="text-label-md text-on-surface font-bold">
              {formatCurrency(lineTotal)}
            </p>
            {item.mrp > item.price && (
              <p className="text-label-sm text-on-surface-variant line-through">
                {formatCurrency(item.mrp * item.quantity)}
              </p>
            )}
          </div>
        </div>
        {onTogglePantry && (
          <button
            type="button"
            onClick={() => onTogglePantry(skuId, !isPantry)}
            aria-pressed={isPantry}
            className={`mt-2 text-label-sm font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isPantry
                ? 'text-success-veg bg-success-veg/10'
                : 'text-on-surface-variant hover:text-success-veg hover:bg-success-veg/10'
            }`}
          >
            <Check size={14} />
            {isPantry ? 'In pantry — not buying' : 'Already have at home'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
