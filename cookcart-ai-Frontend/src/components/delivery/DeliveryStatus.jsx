import { motion } from 'framer-motion'
import { CheckCircle2, Loader, CircleDashed } from 'lucide-react'
import { DELIVERY } from '../../utils/mockData.js'

const STATUS_ICONS = {
  done: CheckCircle2,
  active: Loader,
  pending: CircleDashed,
}

export default function DeliveryStatus({ timeline = DELIVERY.timeline }) {

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-card-soft border border-border-light/50">
      <h2 className="font-display text-headline-md text-on-surface mb-6">Order Status</h2>
      <div className="relative pl-6 border-l-2 border-surface-variant space-y-7">
        {timeline.map((step, index) => {
          const Icon = STATUS_ICONS[step.status]
          const isActive = step.status === 'active'
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {step.status === 'done' ? (
                <span className="absolute -left-[31px] w-4 h-4 rounded-full bg-success-veg ring-4 ring-surface" />
              ) : isActive ? (
                <span className="absolute -left-[31px] w-4 h-4 rounded-full bg-success-veg ring-4 ring-surface ring-opacity-50 animate-pulse" />
              ) : (
                <span className="absolute -left-[31px] w-4 h-4 rounded-full bg-surface-container-highest ring-4 ring-surface" />
              )}
              <div className="flex items-center gap-2">
                <Icon
                  size={16}
                  className={
                    step.status === 'done'
                      ? 'text-success-veg'
                      : isActive
                        ? 'text-success-veg animate-spin'
                        : 'text-on-surface-variant'
                  }
                />
                <h4
                  className={`text-label-md font-semibold ${
                    isActive ? 'text-success-veg' : 'text-on-surface'
                  }`}
                >
                  {step.title}
                </h4>
              </div>
              <p className="text-label-sm text-on-surface-variant mt-0.5">{step.time}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
