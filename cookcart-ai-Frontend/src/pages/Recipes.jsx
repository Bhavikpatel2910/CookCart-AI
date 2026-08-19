import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SearchBar from '../components/common/SearchBar.jsx'
import Chip from '../components/common/Chip.jsx'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import { useApp } from '../context/AppContext.jsx'
import { FILTERS } from '../utils/constants.js'
import { fadeUp, staggerContainer } from '../utils/animations.js'
import { getQuickRecipes, getFeaturedRecipes } from '../services/recipeService.js'

export default function Recipes() {
  const navigate = useNavigate()
  const { recipes, loading } = useApp()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Veg')
  const [quickRecipes, setQuickRecipes] = useState([])
  const [popular, setPopular] = useState([])

  useEffect(() => {
    if (recipes.length > 0) {
      getQuickRecipes().then(setQuickRecipes)
      getFeaturedRecipes().then(setPopular)
    }
  }, [recipes])

  const handleSearch = (value) => {
    navigate(`/search?q=${encodeURIComponent(value || 'Paneer Butter Masala')}`)
  }

  if (loading) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-section-gap">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-section-gap">
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl md:text-[48px] font-bold text-on-surface tracking-tight"
        >
          What do you want to cook?
        </motion.h1>

        <motion.div variants={fadeUp} className="max-w-3xl">
          <SearchBar
            size="lg"
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Search Paneer Butter Masala, Biryani…"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((filter) => (
            <Chip
              key={filter}
              active={activeFilter === filter}
              dotClass={filter === 'Veg' ? 'bg-white' : undefined}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Chip>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col gap-5"
      >
        <motion.div variants={fadeUp} className="flex justify-between items-end">
          <h2 className="font-display text-2xl md:text-[32px] font-bold text-on-surface">
            Popular Tonight
          </h2>
          <button
            type="button"
            className="text-label-md text-success-veg hover:underline font-semibold inline-flex items-center gap-1"
          >
            See all <ArrowRight size={16} />
          </button>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {popular.map((recipe, index) => (
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
                calories: 350,
                isVeg: recipe.dietType !== 'Non-Vegetarian',
                price: 299,
                rating: 4.7,
              }}
              variant="discovery"
              delay={index * 0.07}
            />
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col gap-5"
      >
        <motion.div variants={fadeUp} className="flex justify-between items-end">
          <h2 className="font-display text-2xl md:text-[32px] font-bold text-on-surface">
            Under 30 Minutes
          </h2>
          <span className="text-label-sm text-on-surface-variant">
            {quickRecipes.length} quick recipes
          </span>
        </motion.div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {quickRecipes.map((recipe, index) => (
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
                calories: 350,
                isVeg: recipe.dietType !== 'Non-Vegetarian',
                price: 299,
                rating: 4.7,
              }}
              variant="quick"
              delay={index * 0.06}
            />
          ))}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <div className="bg-brand-dark rounded-[28px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-success-veg/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-10 w-56 h-56 bg-accent-green/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
                Craving something specific?
              </h2>
              <p className="text-body-md text-white/70 mt-2 max-w-lg">
                Type any dish and the AI Chef will build the exact ingredient
                list, quantities and cooking steps for it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('chef-search-input')?.focus()}
              className="shrink-0 bg-success-veg text-white text-label-md font-semibold px-8 py-4 rounded-2xl shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            >
              Ask the AI Chef <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
