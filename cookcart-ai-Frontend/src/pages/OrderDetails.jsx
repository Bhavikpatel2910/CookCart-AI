import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowRight, PackageCheck, RotateCcw } from 'lucide-react'
import SmartImage from '../components/common/SmartImage.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { formatCurrency, formatDateTime } from '../utils/helpers.js'
import { getOrderDisplay, STATUS_LABEL } from '../api/orderApi.js'

function money(value) {
  return formatCurrency(value || 0)
}

export default function OrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
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
      <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14">
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
          title="Order not found"
          description="We couldn't find that order."
          actionLabel="Back to orders"
          onAction={() => navigate('/orders')}
        />
      </div>
    )
  }

  const status = STATUS_LABEL[order.delivery_status] || order.delivery_status || 'Delivered'
  const discount = order.discount || 0
  const deliveryFee = order.delivery_fee ?? 0

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14">
      <button
        type="button"
        onClick={() => navigate('/orders')}
        className="text-label-sm text-success-veg font-semibold mb-5 inline-flex items-center gap-1"
      >
        <ArrowRight size={14} className="rotate-180" /> Back to orders
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 flex flex-col gap-5 min-w-0">
          <section className="bg-surface rounded-2xl border border-border-light p-6">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-success-veg/10 text-success-veg flex items-center justify-center">
                <PackageCheck size={22} />
              </span>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
                  #{order.order_id}
                </h1>
                <p className="text-label-sm text-success-veg">
                  {status}
                  {order.created_at ? ` · ${formatDateTime(order.created_at)}` : ''}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-border-light p-6">
            <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface mb-4">
              Purchased products
            </h2>
            <div className="flex flex-col gap-3">
              {order.itemDetails?.length ? (
                order.itemDetails.map((item) => (
                  <div key={item.sku_id} className="flex items-center gap-3">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      kind="product"
                      className="w-12 h-12 rounded-lg object-cover bg-surface-container-lowest"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md text-on-surface truncate">{item.name}</p>
                      <p className="text-label-sm text-on-surface-variant">×{item.quantity}</p>
                    </div>
                    <strong className="text-label-md text-on-surface">{money(item.lineTotal)}</strong>
                  </div>
                ))
              ) : (
                <p className="text-body-md text-on-surface-variant">No items recorded.</p>
              )}
            </div>
          </section>
        </main>

        <aside className="lg:w-96 bg-surface rounded-2xl border border-border-light p-6 h-fit lg:sticky lg:top-28">
          {order.recipeImage && (
            <SmartImage src={order.recipeImage} alt={order.recipeName} kind="recipe" className="w-full h-44 object-cover rounded-xl" />
          )}
          <h2 className="font-display text-2xl font-bold text-on-surface mt-4">{order.recipeName}</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            {order.itemCount || 0} items
          </p>

          <div className="flex flex-col gap-2 mt-4 text-body-md">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="text-on-surface">{money(order.subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success-veg">
                <span>Savings</span>
                <span>-{money(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-on-surface-variant">
              <span>Delivery</span>
              <span className="text-on-surface">{deliveryFee === 0 ? 'FREE' : money(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-light text-on-surface font-semibold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>

          {order.recipeSlug && (
            <Link
              to={`/recipe/${order.recipeSlug}`}
              className="mt-5 w-full bg-success-veg text-white font-bold py-3 rounded-xl inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <RotateCcw size={18} /> Cook this again
            </Link>
          )}
        </aside>
      </div>
    </div>
  )
}
