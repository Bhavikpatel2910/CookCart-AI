import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, listItem } from '../../utils/animations.js'

export default function ChefTips({ tips = [], className = '' }) {
  if (!tips.length) return null

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={`bg-gradient-to-br from-surface-soft to-surface-soft/60 border border-tertiary-fixed rounded-2xl p-6 shadow-soft relative overflow-hidden ${className}`}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-success-veg/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-4 bottom-0 w-24 h-24 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-5">
        <span className="w-9 h-9 rounded-xl bg-success-veg/15 text-success-veg flex items-center justify-center">
          <Sparkles size={18} />
        </span>
        <div>
          <h3 className="font-display text-headline-md text-on-surface">Chef Tips</h3>
          <p className="text-label-sm text-on-surface-variant">
            Straight from the Chef AI
          </p>
        </div>
      </div>

      <motion.ul className="flex flex-col gap-4">
        {tips.map((item, index) => (
          <motion.li key={index} variants={listItem} className="flex gap-3">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border-light"
              />
            ) : (
              <span className="w-12 h-12 rounded-xl bg-success-veg/10 text-success-veg flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </span>
            )}
            <div className="flex-1">
              <p className="text-body-md text-on-surface leading-relaxed">
                <span className="text-success-veg font-semibold">Chef Tip {index + 1}: </span>
                {item.tip}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  )
}
