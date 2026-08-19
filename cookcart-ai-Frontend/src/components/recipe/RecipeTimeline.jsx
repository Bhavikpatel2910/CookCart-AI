import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { listItem, staggerContainer } from '../../utils/animations.js'

export default function RecipeTimeline({ steps = [], className = '' }) {
  if (!steps.length) return null

  return (
    <motion.ol
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={`relative space-y-6 ${className}`}
    >
      {steps.map((step, index) => (
        <motion.li key={`${step.title}-${index}`} variants={listItem} className="relative pl-14 group">
          {index < steps.length - 1 && (
            <span className="absolute left-[23px] top-14 bottom-[-16px] w-px bg-surface-container-highest group-hover:bg-success-veg/40 transition-colors" />
          )}
          <span className="absolute left-0 top-0 w-12 h-12 rounded-full bg-surface-container-lowest border border-border-light shadow-soft flex items-center justify-center font-display text-body-lg font-bold text-secondary group-hover:bg-success-veg group-hover:text-white group-hover:border-success-veg transition-colors duration-200">
            {index + 1}
          </span>
          <div className="bg-surface-container-lowest rounded-2xl shadow-card-soft p-5 hover:-translate-y-1 hover:shadow-medium transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h4 className="text-label-md text-on-surface font-semibold">
                Step {index + 1} · {step.title}
              </h4>
              {step.time && (
                <span className="inline-flex items-center gap-1 text-label-sm text-success-veg bg-surface-soft px-2.5 py-1 rounded-full w-fit">
                  <Clock size={14} /> {step.time} min
                </span>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {step.description}
            </p>
            {step.ingredients?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border-light">
                {step.ingredients.map((ingredient) => (
                  <span
                    key={ingredient.name}
                    className="text-label-sm text-on-surface bg-surface-container-high rounded-full px-3 py-1"
                  >
                    {ingredient.name} · {ingredient.qty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}
