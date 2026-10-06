import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Flame, ArrowRight, ShoppingBasket, Timer } from 'lucide-react'
import { VegBadge } from '../common/Badge.jsx'
import SmartImage from '../common/SmartImage.jsx'
import { formatCurrency } from '../../utils/helpers.js'

export default function RecipeCard({
  recipe,
  variant = 'classic',
  delay = 0,
}) {
  const {
    slug,
    name,
    cardImage,
    image,
    time,
    difficulty,
    calories,
    isVeg,
    price,
    rating,
  } = recipe

  const img = cardImage ?? image

  if (variant === 'quick') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay }}
        className="w-64 shrink-0 bg-surface-container-lowest rounded-[20px] overflow-hidden shadow-card-soft lift-hover flex flex-col border border-border-light/50"
      >
        <div className="h-32 w-full">
          <SmartImage src={img} alt={name} kind="recipe" className="w-full h-full object-cover" />
        </div>
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-label-md text-on-surface truncate">{name}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-label-sm text-on-surface-variant">
              {formatCurrency(price)}
            </span>
            <Link
              to={`/recipe/${slug}`}
              aria-label={`Cook ${name}`}
              className="bg-surface-soft text-success-veg p-1.5 rounded-lg hover:bg-success-veg hover:text-white transition-colors"
            >
              <ShoppingBasket size={18} />
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  const isDiscovery = variant === 'discovery'

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -6 }}
      className="h-full bg-surface-container-lowest rounded-3xl shadow-card-soft hover:shadow-card-hover transition-shadow duration-300 flex flex-col overflow-hidden border border-border-light/60 group"
    >
      <Link to={`/recipe/${slug}`} className="relative h-48 shrink-0 block overflow-hidden">
        <SmartImage
          src={img}
          alt={name}
          kind="recipe"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <VegBadge isVeg={isVeg} className="absolute top-3 left-3" />
        {isDiscovery && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-label-sm flex items-center gap-1 shadow-sm">
            <Timer size={14} className="text-warning" />
            {time.total} mins
          </span>
        )}
      </Link>

      {/* Fixed vertical rhythm: title block (always 2 lines tall) → meta row → footer pinned to bottom */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        <Link to={`/recipe/${slug}`} className="block">
          <h3 className="font-display text-[20px] leading-[1.25] font-semibold text-on-surface line-clamp-2 h-[2.5em] hover:text-secondary transition-colors">
            {name}
          </h3>
        </Link>

        {isDiscovery ? (
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant h-5">
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-sm border flex items-center justify-center p-[1px] ${
                  isVeg ? 'border-success-veg' : 'border-error'
                }`}
              >
                <span
                  className={`w-full h-full rounded-full ${isVeg ? 'bg-success-veg' : 'bg-error'}`}
                />
              </span>
              {isVeg ? 'Pure Veg' : 'Non-Veg'}
            </span>
            <span>•</span>
            <span>{calories != null ? `${calories} kcal` : 'Veg'}</span>
            {rating && <span className="ml-auto flex items-center gap-1">★ {rating}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-3 h-5">
            <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
              <Clock size={16} /> {time.total} mins
            </span>
            <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
              <Flame size={16} /> {difficulty}
            </span>
          </div>
        )}

        {isDiscovery ? (
          <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-border-light">
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-on-surface-variant leading-none">Ingredients from</span>
              <span className="text-label-md font-bold text-on-surface leading-none">
                {formatCurrency(price)}
              </span>
            </div>
            <Link
              to={`/recipe/${slug}`}
              className="bg-success-veg text-white px-4 py-2.5 rounded-xl text-label-md font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              Cook This <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <Link
            to={`/recipe/${slug}`}
            className="mt-auto w-full py-3 bg-success-veg text-white rounded-xl text-label-md font-semibold shadow-sm hover:shadow-md hover:bg-[#12b052] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Cook at Home
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </motion.article>
  )
}
