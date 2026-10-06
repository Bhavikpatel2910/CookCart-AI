import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ArrowRight, Bike, CheckCircle2, ChevronDown, Clock, CreditCard, Landmark, MapPin, Phone, User as UserIcon, Zap } from 'lucide-react'
import { useCart } from '../hooks/useCart.js'
import { useApp } from '../context/AppContext.jsx'
import { placeOrder } from '../api/orderApi.js'
import { useAuth } from '../hooks/useAuth.js'
import { fadeUp } from '../utils/animations.js'
import { formatCurrency, pluralize } from '../utils/helpers.js'
import { DELIVERY_FEE, EXPRESS_DELIVERY_FEE, PACKAGING_FEE } from '../utils/constants.js'
import SmartImage from '../components/common/SmartImage.jsx'

const DELIVERY_OPTIONS = [
  {
    id: 'express',
    title: 'Express',
    eta: '15 mins',
    price: EXPRESS_DELIVERY_FEE,
    icon: Zap,
    tag: 'Fastest',
  },
  {
    id: 'standard',
    title: 'Standard',
    eta: '30 mins',
    price: DELIVERY_FEE,
    icon: Bike,
    tag: 'Free',
  },
]

const PAYMENT_OPTIONS = [
  { id: 'upi', title: 'UPI', desc: 'GPay, PhonePe, Paytm', icon: CreditCard },
  { id: 'card', title: 'Card', desc: 'Credit / Debit / Netbanking', icon: Landmark },
  { id: 'cod', title: 'Cash on Delivery', desc: 'Pay at your doorstep', icon: CreditCard },
]

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, clearCart } = useCart()
  const { recipes } = useApp()
  const { user: authUser, isAuthenticated } = useAuth()

  // Orders need a signed-in user so they can be saved to (and listed from) the database.
  useEffect(() => {
    if (!isAuthenticated) {
      toast('Please sign in to place your order')
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [isAuthenticated, navigate, location])

  // Items marked "already in pantry" aren't bought, so they aren't ordered or charged.
  const buyItems = useMemo(() => items.filter((item) => !item.fromPantry), [items])
  const itemsTotal = useMemo(
    () => buyItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [buyItems],
  )
  const pantryCount = items.length - buyItems.length

  // The order belongs to the recipe most of the basket was added for.
  const orderRecipe = useMemo(() => {
    const counts = new Map()
    buyItems.forEach((item) => item.recipeId && counts.set(item.recipeId, (counts.get(item.recipeId) || 0) + 1))
    const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    return recipes.find((r) => r.recipeId === topId) || null
  }, [buyItems, recipes])
  const [deliveryMethod, setDeliveryMethod] = useState('express')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [placing, setPlacing] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: authUser?.name || '',
      phone: authUser?.phone || '',
      line1: '',
      line2: '',
    },
    mode: 'onChange',
  })

  const activeFee = DELIVERY_OPTIONS.find((option) => option.id === deliveryMethod)?.price ?? DELIVERY_FEE
  const grandTotal = itemsTotal + activeFee + PACKAGING_FEE

  const onSubmit = async (form) => {
    if (placing || !authUser) return
    setPlacing(true)
    try {
      const order = await placeOrder({
        userId: authUser.user_id,
        items: buyItems.map((item) => ({
          skuId: item.skuId,
          name: item.name,
          brand: item.brand,
          image: item.image,
          packSize: item.packSize,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        recipe: orderRecipe
          ? { id: orderRecipe.recipeId, name: orderRecipe.name, slug: orderRecipe.slug, image: orderRecipe.image, servings: orderRecipe.baseServings ?? orderRecipe.servings }
          : {},
        delivery: {
          method: deliveryMethod,
          fee: activeFee,
          etaMinutes: deliveryMethod === 'express' ? 15 : 30,
        },
        payment: { method: paymentMethod },
        packagingFee: PACKAGING_FEE,
        address: { name: form.name, phone: form.phone, line1: form.line1, line2: form.line2 },
      })
      clearCart()
      toast.success('Order placed! 🎉')
      navigate(`/delivery/${order.order_id}`, { replace: true })
    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error(
        error.response?.data?.error || 'We could not place your order. Your cart is safe — please try again.',
      )
    } finally {
      setPlacing(false)
    }
  }

  const isFormValid = isValid && buyItems.length > 0

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
        <h1 className="font-display text-3xl md:text-[40px] font-bold text-on-surface">Checkout</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          {buyItems.length} {pluralize(buyItems.length, 'item')} · {orderRecipe?.name ?? 'Your grocery order'}
          {pantryCount > 0 && ` · ${pantryCount} already in your pantry`}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: delivery + payment */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Delivery address */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05 }}
            className="bg-surface rounded-2xl shadow-card-soft p-6"
          >
            <h2 className="font-display text-headline-md text-on-surface mb-5">
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
                    <UserIcon size={14} /> Full name
                  </span>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="px-4 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                  />
                  {errors.name && <span className="text-label-sm text-error">{errors.name.message}</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
                    <Phone size={14} /> Phone
                  </span>
                  <input
                    {...register('phone', { required: 'Phone is required', pattern: /^[0-9]{10}$/ })}
                    className="px-4 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                  />
                  {errors.phone && <span className="text-label-sm text-error">{errors.phone.type === 'pattern' ? 'Enter a valid 10-digit phone number' : errors.phone.message}</span>}
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  <MapPin size={14} /> Address
                </span>
                <input
                  {...register('line1', { required: 'Address is required' })}
                  className="px-4 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                />
                {errors.line1 && <span className="text-label-sm text-error">{errors.line1.message}</span>}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-label-sm text-on-surface-variant">Landmark / area</span>
                <input
                  {...register('line2')}
                  className="px-4 py-3 rounded-xl bg-surface-container-lowest border border-border-light text-body-md text-on-surface outline-none focus:border-success-veg focus:ring-2 focus:ring-success-veg/20 transition-all"
                />
              </label>
            </div>
          </motion.section>

          {/* Delivery method */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl shadow-card-soft p-6"
          >
            <h2 className="font-display text-headline-md text-on-surface mb-5">
              Delivery Speed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DELIVERY_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = deliveryMethod === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id)}
                    className={`relative rounded-xl p-4 flex items-center gap-3 border text-left transition-all active:scale-[0.98] ${
                      selected
                        ? 'border-success-veg bg-success-veg/5 ring-2 ring-success-veg/20'
                        : 'border-border-light bg-surface-container-lowest hover:border-success-veg/40'
                    }`}
                  >
                    <span
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? 'bg-success-veg text-white' : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-label-md text-on-surface font-bold">{option.title}</p>
                        <span className="text-label-sm text-success-veg bg-success-veg/10 px-2 py-0.5 rounded-full">
                          {option.tag}
                        </span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {option.eta} · {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                      </p>
                    </div>
                    {selected && <CheckCircle2 size={20} className="text-success-veg shrink-0" />}
                  </button>
                )
              })}
            </div>
          </motion.section>

          {/* Payment */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="bg-surface rounded-2xl shadow-card-soft p-6"
          >
            <h2 className="font-display text-headline-md text-on-surface mb-5">Payment Method</h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = paymentMethod === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      selected
                        ? 'border-success-veg bg-success-veg/5 ring-2 ring-success-veg/20'
                        : 'border-border-light bg-surface-container-lowest hover:border-success-veg/40'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? 'bg-success-veg text-white' : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-label-md text-on-surface font-bold">{option.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{option.desc}</p>
                    </div>
                    {selected && <CheckCircle2 size={20} className="text-success-veg shrink-0" />}
                    {option.id === 'upi' && <ChevronDown size={16} className="text-on-surface-variant" />}
                  </button>
                )
              })}
            </div>
          </motion.section>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-5">
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl shadow-card-soft p-6 lg:sticky lg:top-28"
          >
            <h2 className="font-display text-headline-md text-on-surface mb-5">
              Order Summary
            </h2>
            <div className="max-h-64 overflow-y-auto no-scrollbar flex flex-col gap-3 pr-1">
              {buyItems.map((item) => (
                <div key={item.skuId ?? item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-lowest overflow-hidden shrink-0 relative border border-border-light/50">
                    <SmartImage src={item.image} alt={item.name} kind="product" className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-dark text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <p className="text-label-sm text-on-surface font-semibold flex-1 min-w-0 truncate">
                    {item.name}
                  </p>
                  <span className="text-label-sm text-on-surface font-bold shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-border-light">
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Items total</span>
                <span className="text-on-surface">{formatCurrency(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Delivery fee</span>
                <span className={activeFee === 0 ? 'text-success-veg font-semibold' : 'text-on-surface'}>
                  {activeFee === 0 ? 'FREE' : formatCurrency(activeFee)}
                </span>
              </div>
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Packaging</span>
                <span className="text-on-surface">{formatCurrency(PACKAGING_FEE)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border-light">
                <span className="text-label-md text-on-surface font-semibold">To Pay</span>
                <span className="font-display text-headline-md text-on-surface font-bold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placing || !isFormValid}
              className="w-full mt-6 bg-success-veg text-on-primary text-label-md font-semibold py-4 px-6 rounded-[16px] shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {placing ? (
                <span className="w-5 h-5 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <>
                  Place Order · {formatCurrency(grandTotal)}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            <p className="text-label-sm text-on-surface-variant text-center mt-3">
              By placing this order you agree to our Terms & Privacy Policy
            </p>
          </motion.aside>
        </div>
      </form>
    </div>
  )
}
