import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Gift } from 'lucide-react'
import PantryChecklist from '../components/pantry/PantryChecklist.jsx'
import Button from '../components/common/Button.jsx'
import { usePantry } from '../hooks/usePantry.js'
import { useCart } from '../hooks/useCart.js'
import { fadeUp } from '../utils/animations.js'
import { formatCurrency } from '../utils/helpers.js'

export default function PantryCustomization() {
  const navigate = useNavigate()
  const { items, savings, pantryCount } = usePantry()
  const { setPantry, itemCount } = useCart()

  const originalTotal = items.reduce((sum, item) => sum + item.price, 0)
  const newTotal = originalTotal - savings

  const handleContinue = () => {
    items.forEach((item) => setPantry(item.id, item.inPantry))
    navigate('/cart')
  }

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main column */}
        <div className="md:col-span-8 flex flex-col gap-8">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h1 className="font-display text-3xl md:text-[40px] font-bold text-on-surface mb-2">
              Already have these?
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Uncheck items you already have in your pantry. We'll automatically
              adjust your cart and savings.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            <PantryChecklist />
          </motion.div>
        </div>

        {/* Savings sidebar */}
        <aside className="md:col-span-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="bg-surface p-6 rounded-2xl shadow-card-soft sticky top-28 border border-success-veg/20 bg-gradient-to-br from-surface to-surface-soft relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-success-veg/10 rounded-full blur-2xl" />
            <h3 className="font-display text-headline-md text-on-surface mb-2">
              Pantry Savings
            </h3>
            <p className="text-label-md text-on-secondary-container mb-6 flex items-center gap-1.5">
              <Gift size={18} />
              {pantryCount > 0
                ? `You're saving ${formatCurrency(savings)}`
                : 'Select pantry items to save'}
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border-light">
                <span className="text-body-md text-on-surface-variant">Original Total</span>
                <span className="text-body-md text-on-surface-variant line-through">
                  {formatCurrency(originalTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-label-md text-on-surface font-semibold">New Total</span>
                <span className="font-display text-headline-lg-mobile text-on-surface font-bold">
                  {formatCurrency(newTotal)}
                </span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-success-veg/15 text-success-veg flex items-center justify-center">
                  <Gift size={16} />
                </span>
                <p className="text-label-sm text-on-surface-variant">
                  {pantryCount} item{pantryCount === 1 ? '' : 's'} marked as in pantry
                </p>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Sticky desktop CTA */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-40">
        <button
          type="button"
          onClick={handleContinue}
          className="bg-success-veg text-on-primary text-label-md font-semibold py-4 px-8 rounded-xl shadow-glow-green hover:-translate-y-1 hover:shadow-glow-green-lg transition-all inline-flex items-center gap-4 active:scale-95"
        >
          <span className="flex flex-col text-left border-r border-on-primary/20 pr-4">
            <span>{itemCount} items</span>
            <span className="text-on-primary/80 font-normal">
              {formatCurrency(newTotal + 240)} Total
            </span>
          </span>
          <span className="flex items-center gap-2">
            Continue to Cart <ArrowRight size={18} />
          </span>
        </button>
      </div>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-border-light shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-4 z-40">
        <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full justify-between" onClick={handleContinue}>
          <span className="flex flex-col text-left">
            <span>{itemCount} items to buy</span>
            <span className="text-on-primary/80 text-[11px] font-normal">
              {formatCurrency(newTotal + 240)} Total
            </span>
          </span>
        </Button>
      </div>
    </div>
  )
}
