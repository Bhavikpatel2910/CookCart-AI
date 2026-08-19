import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowRight, Bell, ChefHat, CreditCard, Heart, History, Leaf, MapPin, Package, Settings, ShieldCheck, Sparkles, Star, UtensilsCrossed, LogOut } from 'lucide-react'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useApp } from '../context/AppContext.jsx'
import { fadeUp, staggerContainer } from '../utils/animations.js'
import { formatCurrency } from '../utils/helpers.js'

const MENU = [
  { id: 'orders', label: 'My Orders', icon: Package, value: '' },
  { id: 'saved', label: 'Saved Recipes', icon: Heart, value: '' },
  { id: 'address', label: 'Delivery Address', icon: MapPin, value: 'Sector 62, Noida' },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard, value: 'UPI, Cards' },
  { id: 'notifications', label: 'Notifications', icon: Bell, value: 'On' },
  { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck, value: '' },
  { id: 'settings', label: 'Settings', icon: Settings, value: '' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, user: authUser, logout } = useAuth()
  const { recipes } = useApp()
  const [ordersCount, setOrdersCount] = useState(0)
  const [recentOrder, setRecentOrder] = useState(null)

  const favorites = authUser?.favorites || []
  const savedRecipes = recipes.filter((recipe) => favorites.includes(recipe.slug))

  const STAT_CARDS = [
    { id: 'dishes', label: 'Dishes to cook', value: recipes.length, icon: UtensilsCrossed },
    { id: 'saved', label: 'Saved recipes', value: savedRecipes.length, icon: Heart },
    { id: 'orders', label: 'Orders placed', value: ordersCount, icon: Package },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    let active = true
    import('../api/orderApi.js')
      .then(({ getAllOrdersDisplay }) => getAllOrdersDisplay())
      .then((list) => {
        if (!active) return
        setOrdersCount(list.length)
        setRecentOrder(list[0] || null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  if (!isAuthenticated) return null

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Profile header */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-gradient-to-br from-brand-dark via-primary to-success-veg rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mb-8"
      >
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            {authUser?.avatar ? (
              <img
                src={authUser.avatar}
                alt={authUser?.name ?? 'User'}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20"
              />
            ) : (
              <span className="w-24 h-24 rounded-full bg-white/25 ring-4 ring-white/20 flex items-center justify-center text-3xl font-bold">
                {authUser?.initials ?? (authUser?.name?.[0] ?? 'C').toUpperCase()}
              </span>
            )}
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-accent-green text-brand-dark flex items-center justify-center">
              <Star size={12} className="fill-current" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-accent-green text-label-sm font-semibold mb-1">
              <Leaf size={14} />
              {authUser?.preferences?.diet || 'Vegetarian'} · {authUser?.preferences?.cuisine || 'North Indian'} cuisine
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">{authUser?.name ?? 'Chef'}</h1>
            <p className="text-white/80 text-body-md">
              {authUser?.email ?? ''} · {authUser?.phone ?? ''}
            </p>
            <p className="text-white/60 text-label-sm mt-2">
              Member since {authUser?.memberSince || 'March 2024'} · Cooking for {authUser?.preferences?.servings || 4} people
            </p>
          </div>
          <div className="flex md:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => toast('Profile editing is available in this prototype.')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur px-5 py-2.5 rounded-xl text-label-sm font-semibold transition-colors"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => navigate('/chef')}
              className="bg-accent-green text-brand-dark px-5 py-2.5 rounded-xl text-label-sm font-bold hover:-translate-y-0.5 transition-all"
            >
              + New Recipe
            </button>
            <button
              type="button"
              aria-label="Log out"
              onClick={() => { logout(); navigate('/') }}
              className="text-white/80 hover:text-white text-label-sm inline-flex items-center justify-center gap-1"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.id}
              className="bg-surface rounded-2xl p-5 shadow-card-soft flex items-center gap-4 border border-border-light/50"
            >
              <span className="w-12 h-12 rounded-xl bg-success-veg/10 text-success-veg flex items-center justify-center shrink-0">
                <Icon size={22} />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-label-sm text-on-surface-variant">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: menu */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.nav
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl shadow-card-soft p-2 flex flex-col"
          >
            {MENU.map((item) => {
              const Icon = item.icon
              const displayValue =
                item.id === 'orders'
                  ? String(ordersCount)
                  : item.id === 'saved'
                    ? String(savedRecipes.length)
                    : item.value
              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-soft transition-colors group text-left"
                  onClick={() => {
                    const destinations = { orders: '/orders', saved: '/favorites' }
                    if (destinations[item.id]) navigate(destinations[item.id])
                    else toast(`${item.label} is managed in your CookCart preferences.`)
                  }}
                >
                  <span className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface-variant flex items-center justify-center group-hover:text-success-veg group-hover:bg-success-veg/10 transition-colors">
                    <Icon size={17} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-label-md text-on-surface font-semibold">{item.label}</span>
                    {displayValue && (
                      <span className="block text-label-sm text-on-surface-variant truncate">{displayValue}</span>
                    )}
                  </span>
                  <ArrowRight size={16} className="text-on-surface-variant opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                </button>
              )
            })}
          </motion.nav>

          {/* AI chef card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-success-veg to-primary rounded-2xl p-6 text-white relative overflow-hidden"
          >
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <span className="w-11 h-11 rounded-full bg-accent-green text-brand-dark flex items-center justify-center mb-3 relative z-10">
              <Sparkles size={20} />
            </span>
            <h3 className="font-display text-headline-md font-bold relative z-10">
              Ask your AI Chef
            </h3>
            <p className="text-white/80 text-label-md mt-1 relative z-10">
              Get meal ideas, substitute ingredients, or plan a week of dinners.
            </p>
            <button
              type="button"
              onClick={() => navigate('/chef')}
              className="mt-4 bg-white text-success-veg font-bold px-5 py-2.5 rounded-xl text-label-sm hover:-translate-y-0.5 transition-all relative z-10"
            >
              Open AI Chef
            </button>
          </motion.div>
        </div>

        {/* Right: saved recipes + order history */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold text-on-surface flex items-center gap-2">
                <Heart size={22} className="text-success-veg" />
                Saved Recipes
              </h2>
              <Link to="/recipes" className="text-label-sm text-success-veg font-semibold hover:underline">
                View all
              </Link>
            </div>
            {savedRecipes.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-dashed border-border-light p-8 text-center">
                <p className="text-body-md text-on-surface-variant">
                  You haven't saved any recipes yet. Tap a recipe's heart to keep it here.
                </p>
                <Link to="/recipes" className="text-label-sm text-success-veg font-semibold hover:underline mt-2 inline-block">
                  Browse recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.recipeId}
                    recipe={{
                      id: recipe.recipeId,
                      slug: recipe.slug,
                      name: recipe.name,
                      image: recipe.image,
                      cardImage: recipe.image,
                      time: { total: recipe.totalTime },
                      difficulty: recipe.difficulty,
                      calories: recipe.calories ?? null,
                      isVeg: recipe.isVeg,
                      price: recipe.estimatedCost ?? 0,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.section>

          {recentOrder && (
            <motion.section variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
              <h2 className="font-display text-2xl font-bold text-on-surface flex items-center gap-2 mb-4">
                <History size={22} className="text-success-veg" />
                Recent Order
              </h2>
              <div className="bg-surface rounded-2xl p-5 shadow-card-soft border border-border-light/50 flex items-center gap-4">
                {recentOrder.recipeImage && (
                  <div className="w-20 h-20 rounded-xl bg-surface-container-lowest overflow-hidden border border-border-light/50 shrink-0">
                    <SmartImage src={recentOrder.recipeImage} alt={recentOrder.recipeName} kind="recipe" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-label-md text-on-surface font-bold truncate">{recentOrder.recipeName}</h3>
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    Order #{recentOrder.order_id} · {recentOrder.itemCount ?? 0} items
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-display text-headline-md text-on-surface font-bold">
                    {formatCurrency(recentOrder.total || 0)}
                  </p>
                  <Link
                    to={`/orders/${recentOrder.order_id}`}
                    className="bg-success-veg text-white px-5 py-2 rounded-xl text-label-sm font-bold"
                  >
                    View order
                  </Link>
                </div>
              </div>
            </motion.section>
          )}

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="bg-surface-soft border border-success-veg/20 rounded-2xl p-5 flex items-center gap-4"
          >
            <span className="w-11 h-11 rounded-full bg-success-veg text-white flex items-center justify-center shrink-0">
              <ChefHat size={20} />
            </span>
            <div className="flex-1">
              <h3 className="text-label-md text-on-surface font-bold">Cook with confidence</h3>
              <p className="text-label-sm text-on-surface-variant">
                Manage your saved recipes, pantry staples and orders in one place.
              </p>
            </div>
            <Link
              to="/pantry"
              className="text-label-sm text-success-veg font-bold hover:underline shrink-0"
            >
              Open pantry
            </Link>
          </motion.section>
        </div>
      </div>
    </div>
  )
}