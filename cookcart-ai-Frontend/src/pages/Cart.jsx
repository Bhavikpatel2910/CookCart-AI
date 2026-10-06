import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import CartItem from '../components/cart/CartItem.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import Button from '../components/common/Button.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { useApp } from '../context/AppContext.jsx'
import { fadeUp, staggerContainer } from '../utils/animations.js'

export default function Cart() {
  const navigate = useNavigate()
  const { items, totals, updateQuantity, removeItem, setPantry, clearCart } = useCart()
  const { recipes } = useApp()
  const { isAuthenticated } = useAuth()

  const pantryCount = useMemo(() => items.filter((item) => item.fromPantry).length, [items])
  const suggestions = useMemo(() => recipes.slice(0, 2), [recipes])

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      toast('Please sign in to place your order')
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  if (!items.length) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-20 md:py-32 flex flex-col items-center text-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-surface-soft flex items-center justify-center mb-6"
        >
          <ShoppingBag size={36} className="text-success-veg" />
        </motion.span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-3">
          Your cart is empty
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
          Browse recipes and add ingredients to your basket — we'll get everything
          ready for your next meal.
        </p>
        <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/recipes')}>
          Explore Recipes
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-display text-3xl md:text-[40px] font-bold text-on-surface">
            My Cart
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {items.length} item{items.length === 1 ? '' : 's'} · {pantryCount} marked as in
            pantry
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-label-sm text-on-surface-variant hover:text-error underline underline-offset-4 transition-colors w-fit"
        >
          Clear cart
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItem
                  key={item.skuId ?? item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                  onTogglePantry={setPantry}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Suggestions */}
          <section className="mt-4">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              You may also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((recipe) => (
                <Link
                  key={recipe.recipeId}
                  to={`/recipe/${recipe.slug}`}
                  className="bg-surface rounded-xl overflow-hidden border border-border-light/50 hover:shadow-card-soft hover:-translate-y-1 transition-all group"
                >
                  <div className="relative h-40 overflow-hidden">
                    <SmartImage
                      src={recipe.image}
                      alt={recipe.name}
                      kind="recipe"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-label-md text-on-surface font-bold truncate">
                        {recipe.name}
                      </h3>
                      <p className="text-label-sm text-on-surface-variant">
                        {recipe.totalTime} min · {recipe.rating || 4.7} ★
                      </p>
                    </div>
                    <span className="text-success-veg shrink-0">
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Summary column */}
        <div className="lg:col-span-4">
          <CartSummary items={items} totals={totals} onCheckout={handlePlaceOrder} className="lg:sticky lg:top-28" />
        </div>
      </div>
    </div>
  )
}
