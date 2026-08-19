import { motion } from 'framer-motion'
import { usePantry } from '../../hooks/usePantry.js'
import { staggerContainer, listItem } from '../../utils/animations.js'
import SmartImage from '../common/SmartImage.jsx'

export default function PantryChecklist({ items: customItems, className = '' }) {
  const { items: pantryItems, toggleItem } = usePantry()
  const items = customItems ?? pantryItems

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className={`flex flex-col gap-3 ${className}`}
    >
      {items.map((item) => {
        const checked = item.inPantry
        return (
          <motion.label
            key={item.id}
            variants={listItem}
            className="relative cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleItem(item.id)}
              className="sr-only"
            />
            <div
              className={`bg-surface p-4 rounded-xl shadow-card-soft flex items-center justify-between border transition-all duration-300 ${
                checked
                  ? 'border-transparent opacity-60'
                  : 'border-transparent hover:shadow-medium hover:-translate-y-[2px]'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-16 h-16 rounded-lg ${item.bg ?? 'bg-surface-container-low'} overflow-hidden flex-shrink-0 flex items-center justify-center`}
                >
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    kind="product"
                    className={`w-full h-full object-cover ${checked ? 'opacity-70' : ''}`}
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-label-md transition-colors truncate ${
                      checked ? 'line-through text-on-surface-variant' : 'text-on-surface'
                    }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-label-sm mt-1 ${
                      checked ? 'text-on-surface-variant line-through' : 'text-on-surface-variant'
                    }`}
                  >
                    ₹{item.price}
                  </span>
                </div>
              </div>
              <input type="checkbox" checked={checked} readOnly className="custom-checkbox" />
            </div>
          </motion.label>
        )
      })}
    </motion.div>
  )
}
