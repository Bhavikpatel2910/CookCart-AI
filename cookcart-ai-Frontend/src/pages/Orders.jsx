import { useEffect, useState } from 'react'
import { ArrowRight, CalendarClock, LogIn, Package, ReceiptText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import EmptyState from '../components/common/EmptyState.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import { formatCurrency, formatDateTime } from '../utils/helpers.js'
import { getAllOrdersDisplay, STATUS_LABEL } from '../api/orderApi.js'
import { useAuth } from '../hooks/useAuth.js'
import { fadeUp, staggerContainer } from '../utils/animations.js'

const STATUS_TONE = {
  delivered: 'text-success-veg bg-success-veg/10',
  cancelled: 'text-error bg-error/10',
}

export default function Orders() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return undefined
    }
    let active = true
    setLoading(true)
    getAllOrdersDisplay(user.user_id)
      .then((data) => {
        if (active) {
          setOrders(data)
          setError(null)
        }
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [isAuthenticated, user?.user_id])

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">My orders</h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          Every basket you've ordered, saved to your account with the exact date and time.
        </p>
      </motion.div>

      {!isAuthenticated ? (
        <EmptyState
          icon={LogIn}
          title="Sign in to see your orders"
          description="Your order history is saved to your account so it follows you across devices."
          actionLabel="Sign in"
          onAction={() => navigate('/login', { state: { from: { pathname: '/orders' } } })}
        />
      ) : loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      ) : error ? (
        <EmptyState
          icon={Package}
          title="Couldn't load your orders"
          description="We couldn't reach the server. Check your connection and try again."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order, it will show up here."
          actionLabel="Browse recipes"
          onAction={() => navigate('/recipes')}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-xl">
            <div className="card-surface !rounded-2xl p-4">
              <p className="text-label-sm text-on-surface-variant">Orders placed</p>
              <p className="font-display text-3xl font-bold text-on-surface">{orders.length}</p>
            </div>
            <div className="card-surface !rounded-2xl p-4">
              <p className="text-label-sm text-on-surface-variant">Total spent</p>
              <p className="font-display text-3xl font-bold text-on-surface">{formatCurrency(totalSpent)}</p>
            </div>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-4">
            {orders.map((order) => (
              <motion.article
                key={order.order_id}
                variants={fadeUp}
                className="card-surface !rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-shadow"
              >
                <SmartImage
                  src={order.recipeImage}
                  alt={order.recipeName}
                  kind="recipe"
                  className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-body-lg font-bold text-on-surface truncate">{order.recipeName}</h2>
                    <span
                      className={`text-label-sm font-semibold px-2.5 py-1 rounded-full ${
                        STATUS_TONE[order.delivery_status] || 'text-warning bg-warning/10'
                      }`}
                    >
                      {STATUS_LABEL[order.delivery_status] || order.delivery_status}
                    </span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock size={14} /> {formatDateTime(order.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ReceiptText size={14} /> #{order.order_id} · {order.itemCount} items
                    </span>
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <p className="font-display text-2xl font-bold text-on-surface">{formatCurrency(order.total || 0)}</p>
                  <Link
                    to={`/orders/${order.order_id}`}
                    className="text-label-md text-success-veg font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View details <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
