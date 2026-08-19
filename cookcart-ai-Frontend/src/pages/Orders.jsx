import { useEffect, useState } from 'react'
import { ArrowRight, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import { formatCurrency, formatTime } from '../utils/helpers.js'
import { getAllOrdersDisplay } from '../api/orderApi.js'
import { STATUS_LABEL } from '../api/orderApi.js'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getAllOrdersDisplay()
      .then((data) => {
        if (active) {
          setOrders(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14">
      <h1 className="font-display text-4xl font-bold text-on-surface">Order history</h1>
      <p className="text-body-md text-on-surface-variant mt-2 mb-8">
        Every basket, delivery, and recipe in one place.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      ) : error ? (
        <EmptyState
          icon={Package}
          title="Couldn't load orders"
          description="Try refreshing the page."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Your completed grocery baskets will appear here."
          actionLabel="Browse recipes"
          onAction={() => navigate('/recipes')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <article
              key={order.order_id}
              className="bg-surface rounded-2xl border border-border-light p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <SmartImage
                src={order.recipeImage}
                alt={order.recipeName}
                kind="recipe"
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-label-md font-bold text-on-surface">{order.recipeName}</h2>
                  <span className="text-label-sm text-success-veg bg-success-veg/10 px-2 py-1 rounded-full">
                    {STATUS_LABEL[order.delivery_status] || order.delivery_status || 'delivered'}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  Order #{order.order_id} · {order.itemCount || 0} items ·{' '}
                  {order.created_at ? formatTime(order.created_at) : '—'}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-display text-xl font-bold text-on-surface">
                  {formatCurrency(order.total || 0)}
                </p>
                <Link
                  to={`/orders/${order.order_id}`}
                  className="text-label-sm text-success-veg font-semibold inline-flex items-center gap-1 mt-1"
                >
                  View details <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
