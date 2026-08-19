import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Timer,
  ShoppingBasket,
} from 'lucide-react'
import Badge from '../common/Badge.jsx'
import SmartImage from '../common/SmartImage.jsx'

export default function RecipeHero({
  recipe,
  onCook,
  showNutrition = true,
}) {
  const navigate = useNavigate()
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden shadow-soft group"
    >
      <div className="h-72 md:h-[400px] w-full relative bg-surface-variant">
        {!imgLoaded && <div className="absolute inset-0 shimmer" />}
        <SmartImage
          src={recipe.image}
          alt={recipe.name}
          kind="recipe"
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="absolute top-4 left-4 flex gap-2">
        <Badge tone="white" className="shadow-sm border border-border-light">
          <span
            className={`w-3 h-3 rounded-full flex items-center justify-center border ${
              recipe.isVeg ? 'border-success-veg' : 'border-error'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                recipe.isVeg ? 'bg-success-veg' : 'bg-error'
              }`}
            />
          </span>
          {recipe.isVeg ? 'Veg' : 'Non-Veg'}
        </Badge>
        {recipe.rating && (
          <Badge tone="white" className="shadow-sm border border-border-light">
            <Star size={14} className="text-warning fill-warning" />
            {recipe.rating}
          </Badge>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="max-w-2xl">
          <span className="inline-block bg-primary text-on-primary text-label-sm font-semibold px-2 py-1 rounded mb-2">
            COOK AT HOME
          </span>
          <h1 className="font-display font-bold text-white text-3xl md:text-5xl tracking-tight drop-shadow-sm">
            {recipe.name}
          </h1>
          <p className="text-white/85 text-body-md md:text-body-lg mt-2 hidden sm:block">
            Get everything you need to cook this {recipe.cuisine?.toLowerCase() ?? 'classic'}{' '}
            at home, delivered in minutes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {recipe.time?.total != null && (
            <div className="flex items-center gap-2 text-white bg-black/40 px-3 py-2 rounded-xl backdrop-blur text-label-sm font-medium">
              <Clock size={16} />
              {recipe.time.total} min
            </div>
          )}
          {showNutrition && recipe.calories != null && (
            <div className="flex items-center gap-2 text-white bg-black/40 px-3 py-2 rounded-xl backdrop-blur text-label-sm font-medium">
              <Flame size={16} />
              {recipe.calories} kcal
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-soft border-t border-border-light p-4 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-label-sm text-on-surface-variant">
            Pre-measured ingredients, everything you need
          </p>
          <p className="font-display text-headline-md text-on-surface font-semibold mt-1">
            {recipe.estimatedCost != null ? (
              <>
                From ₹{recipe.estimatedCost}
              </>
            ) : (
              <span className="text-on-surface-variant font-normal">See recipe for price</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <Timer size={16} /> {recipe.difficulty}
          </div>
          <button
            type="button"
            onClick={() => {
              if (onCook) onCook()
              else navigate(`/recipe/${recipe.slug}`)
            }}
            className="flex-1 sm:flex-none bg-success-veg text-white text-label-md font-semibold px-6 py-3 rounded-xl shadow-glow-green hover:-translate-y-1 transition-transform inline-flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingBasket size={18} />
            {onCook ? 'Cook at Home' : 'View Recipe'}
          </button>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 text-label-sm text-success-veg bg-success-veg/5 px-4 py-2 border-t border-success-veg/10">
        <CheckCircle2 size={14} />
        Everything you need, pre-measured and ready to cook
      </div>
    </motion.section>
  )
}
