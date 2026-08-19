import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Timer } from 'lucide-react'
import Button from '../common/Button.jsx'
import PriceBreakdown from './PriceBreakdown.jsx'
import { formatCurrency } from '../../utils/helpers.js'
import { BRAND } from '../../utils/constants.js'

export default function CartSummary({ totals, onCheckout, className = '' }) {
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (onCheckout) onCheckout()
    else navigate('/checkout')
  }

  return (
    <aside className={`flex flex-col gap-4 ${className}`}>
      <PriceBreakdown totals={totals} />

      <div className="bg-surface-soft border border-success-veg/20 rounded-xl p-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-success-veg/15 text-success-veg flex items-center justify-center shrink-0">
          <Timer size={20} />
        </span>
        <div>
          <p className="text-label-md text-on-surface font-semibold">
            Delivery in {BRAND.deliveryTime}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            To C-402, Green Valley Apartments
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-card-soft p-5 flex flex-col gap-4">
        <Button
          size="xl"
          icon={ArrowRight}
          iconPosition="right"
          className="w-full justify-between"
          onClick={handleCheckout}
        >
          <span>
            Place Order · {formatCurrency(totals.total)}
          </span>
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-label-sm text-on-surface-variant">
          <ShieldCheck size={14} className="text-success-veg" />
          Free delivery · Live order tracking
        </p>
      </div>
    </aside>
  )
}
