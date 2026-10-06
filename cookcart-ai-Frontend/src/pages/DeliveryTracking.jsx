import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChefHat, Clock, PackageCheck, Sparkles, Timer } from 'lucide-react'
import TrackingMap from '../components/delivery/TrackingMap.jsx'
import DeliveryStatus from '../components/delivery/DeliveryStatus.jsx'
import DeliveryPartner from '../components/delivery/DeliveryPartner.jsx'
import Button from '../components/common/Button.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { fadeUp } from '../utils/animations.js'
import { formatCurrency, formatDateTime } from '../utils/helpers.js'
import { getOrderDisplay } from '../api/orderApi.js'

export default function DeliveryTracking() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getOrderDisplay(orderId)
      .then((data) => active && setOrder(data))
      .catch(() => active && setOrder(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14">
        <EmptyState
          icon={PackageCheck}
          title="Nothing to track yet"
          description="Place an order and it will appear here for live tracking."
          actionLabel="Browse recipes"
          onAction={() => navigate('/recipes')}
        />
      </div>
    )
  }

  const placedAt = order.created_at
    ? formatDateTime(order.created_at)
    : 'Just now'

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Order banner */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-gradient-to-br from-brand-dark via-primary to-success-veg rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent-green text-label-sm font-semibold mb-2">
            <Sparkles size={16} />
            Order confirmed
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
            {order.recipeName}
          </h1>
          <p className="text-white/80 text-body-md">
            Order #{order.order_id} · {order.itemCount || 0} items · placed {placedAt}
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur rounded-xl px-6 py-4 flex items-center gap-4 shrink-0">
          <span className="w-12 h-12 rounded-full bg-accent-green text-brand-dark flex items-center justify-center">
            <Timer size={24} />
          </span>
          <div>
            <p className="text-label-sm text-white/70">Estimated delivery</p>
            <p className="font-display text-headline-md font-bold flex items-center gap-1.5">
              8 mins <span className="text-white/60 text-label-sm font-normal">· arriving shortly</span>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map + status */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <TrackingMap />
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            <DeliveryStatus />
          </motion.div>
        </div>

        {/* Partner + recipe CTA */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
            <DeliveryPartner />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl p-6 shadow-card-soft border border-border-light/50"
          >
            <div className="flex items-start gap-4">
              {order.recipeImage && (
                <div className="w-20 h-20 rounded-xl bg-surface-container-lowest overflow-hidden border border-border-light/50 shrink-0">
                  <SmartImage src={order.recipeImage} alt={order.recipeName} kind="recipe" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-label-sm text-on-surface-variant">Preparing your recipe</p>
                <h3 className="text-label-md text-on-surface font-bold">{order.recipeName}</h3>
                <p className="text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <PackageCheck size={14} className="text-success-veg" />
                  {formatCurrency(order.total || 0)} · {order.itemCount || 0} ingredients
                </p>
              </div>
            </div>
            <div className="mt-5 bg-surface-soft border border-success-veg/20 rounded-xl p-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-success-veg/15 text-success-veg flex items-center justify-center shrink-0">
                <Clock size={20} />
              </span>
              <div>
                <p className="text-label-md text-on-surface font-semibold">
                  Track your order live
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  We'll notify you when it's on the way
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="bg-surface rounded-2xl p-6 shadow-card-soft border border-border-light/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-full bg-success-veg text-white flex items-center justify-center">
                <ChefHat size={22} />
              </span>
              <div>
                <p className="text-label-sm text-on-surface-variant">Meanwhile, get ready to cook</p>
                <h3 className="text-label-md text-on-surface font-bold">Prep your kitchen</h3>
              </div>
            </div>
            <p className="text-body-md text-on-surface-variant mb-5">
              While ingredients arrive, review the recipe steps for {order.recipeName} so you're
              ready to cook the moment they land.
            </p>
            {order.recipeSlug ? (
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-center"
                onClick={() => navigate(`/recipe/${order.recipeSlug}`)}
              >
                View Recipe
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-center"
                onClick={() => navigate('/recipes')}
              >
                Browse Recipes
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
