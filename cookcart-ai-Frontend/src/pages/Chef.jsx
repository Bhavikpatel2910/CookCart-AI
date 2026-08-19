import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChefHat, Sparkles, Wand2, Loader2 } from 'lucide-react'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import { useApp } from '../context/AppContext.jsx'
import { fadeUp } from '../utils/animations.js'
import { searchWithIntent } from '../services/searchService.js'

const SUGGESTIONS = [
  'A cozy Sunday dinner for 4',
  'Something under 20 minutes',
  'High-protein vegetarian bowl',
  'What to cook with paneer?',
]

export default function Chef() {
  const navigate = useNavigate()
  const { recipes: _recipes } = useApp()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const handleGenerate = async (event) => {
    event.preventDefault()
    if (!prompt.trim()) return
    setGenerating(true)
    setShowResults(false)
    try {
      const results = await searchWithIntent(prompt)
      setSearchResults(results.recipes)
    } catch (error) {
      console.error('Search failed:', error)
    }
    setTimeout(() => {
      setGenerating(false)
      setShowResults(true)
    }, 1400)
  }

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-section-gap">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-brand-dark to-brand-dark/95 p-8 md:p-14"
      >
        <div className="absolute -left-10 -top-10 w-56 h-56 bg-success-veg/20 rounded-full blur-3xl" />
        <div className="absolute -right-14 -bottom-14 w-64 h-64 bg-accent-green/15 rounded-full blur-3xl" />

        <div className="relative max-w-3xl flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-label-sm text-accent-green font-semibold">
            <ChefHat size={16} /> AI Chef · Powered by CookCart AI
          </span>
          <h1 className="font-display font-bold text-white text-4xl md:text-[52px] leading-[1.05] tracking-tight">
            Tell me what you're in the mood for.
          </h1>
          <p className="text-body-lg text-white/75 max-w-xl">
            Describe a craving, a diet, a time limit — I'll craft a recipe and
            prep the exact ingredient list for delivery.
          </p>

          <form
            onSubmit={handleGenerate}
            className="bg-surface-container-lowest rounded-[20px] shadow-large p-2 flex items-center gap-3 focus-within:ring-2 focus-within:ring-success-veg/60 transition-shadow"
          >
            <Sparkles size={22} className="text-success-veg ml-3 shrink-0" />
            <input
              id="chef-search-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. Creamy tomato pasta for two, ready in 25 minutes"
              className="flex-1 bg-transparent outline-none text-body-md text-on-surface placeholder:text-on-surface-variant py-3 min-w-0"
            />
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="shrink-0 inline-flex items-center gap-2 bg-success-veg text-white text-label-md font-semibold px-5 py-3 rounded-[16px] hover:bg-secondary hover:shadow-glow-green disabled:opacity-50 disabled:hover:bg-success-veg disabled:hover:shadow-none transition-all active:scale-95"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              <span className="hidden sm:inline">Cook it</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="text-label-sm text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full px-4 py-2 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {generating && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-16"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-success-veg/15 flex items-center justify-center">
                <ChefHat size={28} className="text-success-veg" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-success-veg/40 border-t-success-veg animate-spin" />
            </div>
            <p className="text-label-md text-on-surface-variant">
              Building your recipe & fetching ingredients…
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {['Matching servings', 'Selecting pantry', 'Optimizing prices', 'Writing steps'].map(
                (step, index) => (
                  <span
                    key={step}
                    className="text-label-sm text-on-surface-variant bg-surface-container-lowest rounded-full px-3 py-1.5 border border-border-light animate-pulse"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {step}
                  </span>
                ),
              )}
            </div>
          </motion.section>
        )}

        {showResults && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-success-veg/10 text-success-veg flex items-center justify-center">
                <Sparkles size={20} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  Here's what I'd make for you
                </h2>
                <p className="text-label-sm text-on-surface-variant">
                  Based on “{prompt}” · ingredients ready in 10 min
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.slice(0, 3).map((recipe, index) => (
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
            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(`/recipe/${searchResults[0].slug}`)}
                className="self-start inline-flex items-center gap-2 bg-success-veg text-white text-label-md font-semibold px-8 py-4 rounded-2xl shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-1 transition-all active:scale-95"
              >
                Start with {searchResults[0].name} <ArrowRight size={18} />
              </button>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}