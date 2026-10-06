import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Apple,
  ArrowRight,
  Carrot,
  ChefHat,
  Clock,
  Cookie,
  CookingPot,
  Flame,
  Leaf,
  Milk,
  MapPin,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react'
import SearchBar from '../components/common/SearchBar.jsx'
import Chip from '../components/common/Chip.jsx'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import Badge from '../components/common/Badge.jsx'
import { CATEGORIES, FILTERS, STATS, BRAND } from '../utils/constants.js'
import { useApp } from '../context/AppContext.jsx'
import { fadeUp, staggerContainer } from '../utils/animations.js'
import SmartImage from '../components/common/SmartImage.jsx'

const SUGGESTIONS = ['Aloo Paratha', 'Biryani', 'Pav Bhaji', 'Pasta']

const CATEGORY_ICONS = {
  vegetables: Carrot,
  dairy: Milk,
  greens: Leaf,
  munchies: Cookie,
  fruits: Apple,
  spices: CookingPot,
}

const FLOW = [
  { icon: SearchBarIcon, title: 'Search any dish', text: 'Craving it? Type it. We build the exact ingredient list.' },
  { icon: Sparkles, title: 'AI builds the recipe', text: 'Smart servings, exact quantities and zero guesswork.' },
  { icon: ShoppingBasketIcon, title: 'Get ingredients', text: 'Every item added to your cart in one tap.' },
  { icon: ChefHat, title: 'Cook with guidance', text: 'Step-by-step cooking mode while your timer runs.' },
]

function SearchBarIcon(props) {
  return <SearchGlyph {...props} />
}
function SearchGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
function ShoppingBasketIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 11 4-7" />
      <path d="m19 11-4-7" />
      <path d="M2 11h20" />
      <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4" />
      <path d="M9 11v5" />
      <path d="M15 11v5" />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { recipes, loading: recipesLoading } = useApp()
  const [query, setQuery] = useState('')

  const handleSearch = (value) => {
    navigate(`/search?q=${encodeURIComponent(value || 'Aloo Paratha')}`)
  }

  const featuredRecipes = recipes.slice(0, 4)
  const heroRecipe = recipes.find((r) => r.slug === 'aloo-paratha') || recipes[0]

  if (recipesLoading) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 flex flex-col gap-section-gap py-10 md:py-14">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 flex flex-col gap-section-gap py-10 md:py-14">
      {/* Hero */}
      <section className="relative rounded-[28px] overflow-hidden shadow-large bg-brand-dark">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-success-veg/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-saffron/25 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/75 to-brand-dark/40" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 px-6 md:px-12 py-14 md:py-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 flex flex-col items-start gap-6"
          >
            <motion.div variants={fadeUp}>
              <Badge tone="dark" className="border border-accent-green/30">
                <Sparkles size={14} className="text-accent-green" />
                {BRAND.tagline}
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-white text-4xl md:text-6xl xl:text-[64px] leading-[1.05] tracking-tight"
            >
              Cook anything.
              <br />
              We bring the{' '}
              <span className="text-gradient-green">ingredients</span> to your
              kitchen.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-body-lg text-white/80 max-w-xl"
            >
              {BRAND.name} turns grocery shopping into a guided cooking journey.
              Search a dish, let AI prep the recipe, and get exact ingredients in
              {` ${BRAND.deliveryTime}`}.
            </motion.p>

            <motion.div variants={fadeUp} className="w-full max-w-2xl">
              <SearchBar
                size="lg"
                value={query}
                onChange={setQuery}
                onSubmit={handleSearch}
                placeholder="What would you like to cook today?"
              />
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-label-sm text-white/60">Try:</span>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSearch(suggestion)}
                    className="text-label-sm text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-4 w-full max-w-xl">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-headline-md text-accent-green font-bold">
                    {stat.value}
                  </p>
                  <p className="text-label-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex lg:col-span-5 relative items-center justify-center"
          >
            <div className="relative w-full max-w-[420px]">
              <div className="absolute inset-0 bg-accent-green/20 blur-[80px] rounded-full" />
              <div className="relative rounded-[28px] overflow-hidden shadow-large border border-white/15 rotate-1 hover:rotate-0 transition-transform duration-500">
                <SmartImage
                  src={heroRecipe?.image}
                  alt={heroRecipe?.name ?? 'Featured dish'}
                  kind="recipe"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-label-sm text-accent-green font-semibold flex items-center gap-1">
                      <Leaf size={14} /> {heroRecipe?.isVeg ? '100% Veg' : 'Protein-rich'}
                    </p>
                    <p className="font-display text-white font-bold text-2xl">{heroRecipe?.name ?? 'Featured dish'}</p>
                  </div>
                  <Link
                    to={`/recipe/${heroRecipe?.slug ?? 'aloo-paratha'}`}
                    className="bg-success-veg text-white rounded-full p-3 hover:scale-110 transition-transform shadow-glow-green"
                    aria-label="View recipe"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 bg-surface-container-lowest rounded-2xl shadow-medium px-4 py-3 flex items-center gap-3 animate-float">
                <span className="w-9 h-9 rounded-xl bg-surface-soft text-success-veg flex items-center justify-center">
                  <Timer size={18} />
                </span>
                <div>
                  <p className="text-label-md text-on-surface font-bold leading-none">8 min</p>
                  <p className="text-label-sm text-on-surface-variant mt-1">To your door</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-3 bg-surface-container-lowest rounded-2xl shadow-medium px-4 py-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-cheese-bg text-warning flex items-center justify-center">
                  <Flame size={18} />
                </span>
                <div>
                    <p className="text-label-md text-on-surface font-bold leading-none">
                      {heroRecipe?.calories != null ? `${heroRecipe.calories} kcal` : `${heroRecipe?.time?.total ?? '—'} min`}
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-1">
                      {heroRecipe?.calories != null ? 'per serving' : 'to make'}
                    </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FLOW.map(({ icon: Icon, title, text }, index) => (
          <motion.div
            key={title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="bg-surface-container-lowest rounded-2xl shadow-card-soft p-6 hover:-translate-y-1 hover:shadow-medium transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-11 h-11 rounded-2xl bg-success-veg/10 text-success-veg flex items-center justify-center">
                <Icon size={22} />
              </span>
              <span className="font-display text-label-sm text-on-surface-variant font-bold">
                0{index + 1}
              </span>
            </div>
            <h3 className="font-display text-[18px] font-bold text-on-surface mb-1.5">{title}</h3>
            <p className="text-label-sm text-on-surface-variant leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-display text-3xl md:text-[40px] font-bold text-on-surface tracking-tight"
          >
            Shop by Category
          </motion.h2>
          <Link
            to="/recipes"
            className="hidden sm:inline-flex items-center gap-1 text-label-md text-success-veg hover:text-secondary font-semibold transition-colors"
          >
            Browse all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {CATEGORIES.map((category, index) => {
            const CategoryIcon = CATEGORY_ICONS[category.id] || Leaf
            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(category.name)}`)}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-full aspect-square rounded-2xl ${category.bg} shadow-sm flex items-center justify-center overflow-hidden transition-shadow group-hover:shadow-medium`}
                >
                  <CategoryIcon
                    size={34}
                    className="text-on-surface/75 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-label-sm text-center text-on-surface">{category.name}</span>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Recipes */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-display text-3xl md:text-[40px] font-bold text-on-surface tracking-tight flex items-center gap-3"
          >
            Cook something delicious
            <span className="hidden md:inline-flex items-center gap-1 text-label-md text-on-surface-variant font-normal bg-surface-container-lowest rounded-full px-4 py-1.5 shadow-card-soft">
              <Clock size={14} className="text-success-veg" /> 10-min delivery
            </span>
          </motion.h2>
          <Link
            to="/recipes"
            className="hidden sm:inline-flex items-center gap-1 text-label-md text-success-veg hover:text-secondary font-semibold transition-colors"
          >
            See all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredRecipes.map((recipe, index) => (
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
              delay={index * 0.06}
            />
          ))}
        </div>
      </section>

      {/* Delivery banner */}
      <section className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-surface-soft via-surface-soft/50 to-cheese-bg/60 border border-tertiary-fixed p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-success-veg/10 rounded-full blur-3xl" />
        <div className="flex-1">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-3">
            Delivery in{' '}
            <span className="text-success-veg">{BRAND.deliveryTime}</span>,
            <br className="hidden md:block" /> cooking in zero.
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            Your ingredients arrive while you prep. Track the rider live and
            jump straight into AI-guided cooking mode the second they land.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/tracking"
              className="inline-flex items-center gap-2 bg-brand-dark text-white text-label-md font-semibold px-6 py-3 rounded-2xl hover:bg-brand-dark/90 transition-colors shadow-medium"
            >
              <MapPin size={16} className="text-accent-green" />
              Track an order
            </Link>
            <Link
              to="/recipes"
              className="inline-flex items-center gap-2 bg-surface-container-lowest text-on-surface text-label-md font-semibold px-6 py-3 rounded-2xl border border-border-light hover:bg-surface-container-low transition-colors"
            >
              <Zap size={16} className="text-success-veg" />
              Explore recipes
            </Link>
          </div>
        </div>
        <div className="flex md:flex-col gap-4">
          {[
            { label: 'Right quantities', value: '100%' },
            { label: 'Ingredient match', value: '12/12' },
            { label: 'Zero missing', value: '0' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-surface-container-lowest rounded-2xl shadow-card-soft px-5 py-4 text-center min-w-[130px]"
            >
              <p className="font-display text-headline-md text-success-veg font-bold">
                {item.value}
              </p>
              <p className="text-label-sm text-on-surface-variant">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick chips */}
      <section className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => (
          <Chip
            key={filter}
            active={filter === 'Veg'}
            dotClass={filter === 'Veg' ? 'bg-white' : undefined}
            onClick={() => navigate(`/search?q=${encodeURIComponent(filter)}`)}
          >
            {filter}
          </Chip>
        ))}
      </section>
    </div>
  )
}