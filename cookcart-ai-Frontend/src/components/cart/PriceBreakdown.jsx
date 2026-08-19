import { formatCurrency } from '../../utils/helpers.js'
import { DELIVERY_FEE, PACKAGING_FEE } from '../../utils/constants.js'

export default function PriceBreakdown({ totals, deliveryFee = DELIVERY_FEE, packagingFee = PACKAGING_FEE }) {
  const grandTotal = Math.max(0, totals.total + deliveryFee + packagingFee)

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card-soft p-5">
      <h3 className="font-display text-headline-md text-on-surface mb-4">
        Price Breakdown
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Items total</span>
          <span className="text-on-surface">{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.pantrySavings > 0 && (
          <div className="flex justify-between text-body-md text-success-veg">
            <span>Pantry savings</span>
            <span>-{formatCurrency(totals.pantrySavings)}</span>
          </div>
        )}
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Delivery fee</span>
          <span className={deliveryFee === 0 ? 'text-success-veg font-semibold' : 'text-on-surface'}>
            {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Packaging</span>
          <span className="text-on-surface">{formatCurrency(packagingFee)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-border-light">
          <span className="text-label-md text-on-surface font-semibold">Total</span>
          <span className="font-display text-headline-md text-on-surface font-bold">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
