import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowLeftRight, Check } from 'lucide-react'
import { useCart } from '../../hooks/useCart.js'
import QuantityStepper from '../common/QuantityStepper.jsx'
import SmartImage from '../common/SmartImage.jsx'

export default function IngredientCard({
  ingredient,
  variant = 'overview',
  onOpenChangeSheet,
  onQuantityChange,
  className = '',
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const { product, required, quantity, image, bg, name } = ingredient

  const handleAdd = () => {
    if (product?.skuId) {
      addItem({
        skuId: product.skuId,
        name: product.name,
        packSize: `${product.packSize}${product.unit}`,
        unit: product.unit,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        bg,
        isVeg: true,
        quantity: quantity || 1,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    }
  }

  if (variant === 'review') {
    return (
      <motion.div
        layout
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={`bg-surface-container-lowest rounded-xl shadow-card-soft p-stack-md flex flex-col ${className}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-success-veg">
              <Check size={16} strokeWidth={3} />
            </span>
            <span className="text-label-md text-on-surface">{name}</span>
          </div>
          <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
            Req: {required}
          </span>
        </div>

        <div className="flex gap-4 items-center mt-2 flex-grow">
          <div
            className={`w-16 h-16 rounded-lg ${bg} flex-shrink-0 flex items-center justify-center relative overflow-hidden`}
          >
            <SmartImage src={image} alt={name} kind="product" className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-body-md text-on-surface leading-tight truncate">{product?.name}</p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              Buying: {quantity} pack{quantity > 1 ? 's' : ''} ({required} total)
            </p>
            <p className="text-label-md text-on-surface mt-1">₹{product?.price}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-stack-md pt-stack-sm border-t border-border-light">
          {onOpenChangeSheet ? (
            <button
              type="button"
              onClick={onOpenChangeSheet}
              className="text-label-sm text-secondary flex items-center gap-1 hover:bg-surface-soft px-2 py-1 rounded transition-colors"
            >
              <ArrowLeftRight size={16} /> Change
            </button>
          ) : (
            <span className="text-label-sm text-secondary flex items-center gap-1 px-2 py-1">
              <span className="w-2 h-2 rounded-full bg-success-veg" /> Available
            </span>
          )}
          <QuantityStepper
            value={quantity}
            min={1}
            onChange={(next) => onQuantityChange?.(ingredient.id, next)}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-surface-container-lowest rounded-xl shadow-card-soft p-stack-md flex flex-col ${className}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-success-veg">
            <Check size={16} strokeWidth={3} />
          </span>
          <span className="text-label-md text-on-surface">{name}</span>
        </div>
        <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
          Req: {required}
        </span>
      </div>

      <div className="flex gap-4 items-center mt-2 flex-grow">
        <div
          className={`w-16 h-16 rounded-lg ${bg} flex-shrink-0 flex items-center justify-center relative overflow-hidden`}
        >
          <SmartImage src={image} alt={name} kind="product" className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-body-md text-on-surface leading-tight truncate">{product?.name}</p>
          <p className="text-label-sm text-on-surface-variant mt-1">
            Buying: {quantity} pack{quantity > 1 ? 's' : ''} ({required} total)
          </p>
          <p className="text-label-md text-on-surface mt-1">₹{product?.price}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-stack-md pt-stack-sm border-t border-border-light">
        {onOpenChangeSheet ? (
          <button
            type="button"
            onClick={onOpenChangeSheet}
            className="text-label-sm text-secondary flex items-center gap-1 hover:bg-surface-soft px-2 py-1 rounded transition-colors"
          >
            <ArrowLeftRight size={16} /> Change
          </button>
        ) : (
          <span className="text-label-sm text-secondary flex items-center gap-1 px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-success-veg" /> Available
          </span>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={added}
          className={`inline-flex items-center gap-1.5 rounded-full text-label-sm font-semibold px-4 py-2 transition-all active:scale-95 ${
            added
              ? 'bg-success-veg text-white'
              : 'bg-surface-soft text-secondary hover:bg-success-veg hover:text-white'
          }`}
        >
          {added ? (
            <>
              <Check size={14} strokeWidth={3} /> Added
            </>
          ) : (
            <>
              <Plus size={16} /> Add
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
