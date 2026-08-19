import { Phone, Star, MessageCircle } from 'lucide-react'
import { DELIVERY } from '../../utils/mockData.js'

export default function DeliveryPartner({ partner = DELIVERY.partner }) {
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card-soft border border-border-light/50 flex items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success-veg to-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
          {(partner.name || '?').charAt(0).toUpperCase()}
        </div>
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success-veg border-2 border-surface" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-label-md text-on-surface font-semibold flex items-center gap-2">
          {partner.name}
          <span className="text-label-sm text-on-surface-variant font-normal flex items-center gap-1">
            <Star size={13} className="text-warning fill-warning" /> {partner.rating}
          </span>
        </h3>
        <p className="text-label-sm text-on-surface-variant truncate">
          {partner.vehicle}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="Call partner"
          className="w-11 h-11 rounded-full bg-surface-soft text-success-veg flex items-center justify-center hover:bg-success-veg hover:text-white active:scale-95 transition-all"
        >
          <Phone size={18} />
        </button>
        <button
          type="button"
          aria-label="Message partner"
          className="w-11 h-11 rounded-full bg-surface-soft text-success-veg flex items-center justify-center hover:bg-success-veg hover:text-white active:scale-95 transition-all"
        >
          <MessageCircle size={18} />
        </button>
      </div>
    </div>
  )
}
