import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Timer,
  Sparkles,
} from 'lucide-react'
import ServingSelector from '../components/recipe/ServingSelector.jsx'
import NutritionCard from '../components/recipe/NutritionCard.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import RecipeTimeline from '../components/recipe/RecipeTimeline.jsx'
import ChefTips from '../components/recipe/ChefTips.jsx'
import IngredientCard from '../components/recipe/IngredientCard.jsx'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import Button from '../components/common/Button.jsx'
import { useRecipe } from '../hooks/useRecipe.js'
import { useApp } from '../context/AppContext.jsx'
import { fadeUp, staggerContainer } from '../utils/animations.js'

export default function RecipeOverview() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { activeRecipe, selectRecipe, loading: recipeLoading, error: recipeError } = useRecipe()
  const { recipes } = useApp()

  useEffect(() => {
    if (slug) selectRecipe(slug)
  }, [slug, selectRecipe])

  if (recipeLoading) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      </div>
    )
  }

  if (recipeError || !activeRecipe) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-3">Recipe unavailable</h1>
        <p className="text-body-md text-on-surface-variant mb-7">
          {recipeError || 'Choose a recipe and we will prepare its ingredient list for you.'}
        </p>
        <Link to="/recipes" className="inline-flex rounded-2xl bg-success-veg px-6 py-3 text-label-md font-semibold text-white">
          Browse recipes
        </Link>
      </div>
    )
  }

  const recipe = activeRecipe

  const reassurances = [
    'Right quantities',
    'No missing ingredients',
    `Pre-measured for ${recipe.servings} servings`,
  ]

  const handleGetIngredients = () => {
    navigate(`/ingredients/${recipe.slug}`)
  }

  const recommendedRecipes = recipes
    .filter(r => r.slug !== recipe.slug && r.dishCategory === recipe.dishCategory)
    .slice(0, 3)

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-soft h-[320px] md:h-[420px]"
      >
        <SmartImage src={recipe.image} alt={recipe.name} kind="recipe" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-success-veg/90 text-on-primary text-label-sm shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white mr-1.5" />
            100% {recipe.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>
      </motion.section>

      <div className="bg-surface md:-mt-8 relative z-10 rounded-t-3xl md:rounded-2xl md:mx-4 px-5 md:px-8 py-6 md:py-8 shadow-card-soft">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5 mb-8 border-b border-border-light pb-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-display text-3xl md:text-5xl font-bold text-on-surface tracking-tight">
                {recipe.name}
              </span>
              {recipe.rating && (
                <span className="inline-flex items-center gap-1 text-label-md text-on-surface-variant bg-surface-container-low rounded-full px-3 py-1.5">
                  <Star size={14} className="text-warning fill-warning" />
                  {recipe.rating} ({recipe.reviews || 0})
                </span>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
              {recipe.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: Clock, label: `Prep: ${recipe.time?.prep || 0}m` },
                { icon: Flame, label: `Cook: ${recipe.time?.cook || 0}m` },
                { icon: Timer, label: `Total: ${recipe.time?.total || 0}m` },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-label-sm text-on-surface"
                >
                  <Icon size={16} className="text-on-surface-variant" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left column */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
                How to cook it
              </h2>
              <RecipeTimeline steps={recipe.steps} />
            </motion.section>

            {recipe.scaledIngredients?.length > 0 && (
              <motion.section
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-col gap-4"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="font-display text-2xl font-bold text-on-surface mb-1">
                    Ingredient list
                  </h2>
                  <p className="text-body-md text-on-surface-variant">
                    Pre-measured for your selected servings — tap Add to start building your basket.
                  </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipe.scaledIngredients.map((ingredient) => (
                    <IngredientCard
                      key={ingredient.ingredientId}
                      ingredient={{
                        id: ingredient.ingredientId,
                        name: ingredient.ingredientName,
                        required: `${ingredient.requiredQuantity}${ingredient.requiredUnit}`,
                        requiredQuantity: ingredient.requiredQuantity,
                        quantity: ingredient.packOptimization?.packCount || 1,
                        product: ingredient.product,
                        image: ingredient.product?.image,
                        bg: 'bg-cheese-bg',
                        category: ingredient.ingredientCategory,
                        available: ingredient.inventory?.inStock !== false,
                      }}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {recipe.chefTips?.length > 0 && (
              <ChefTips tips={recipe.chefTips} />
            )}
          </div>

          {/* Right sticky column */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 flex flex-col gap-4">
              <div className="bg-surface-container-lowest rounded-2xl shadow-card-soft p-6 border border-border-light flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h2 className="font-display text-lg font-bold text-on-surface">
                    Servings
                  </h2>
                  <ServingSelector />
                  <p className="text-label-sm text-on-surface-variant">
                    {recipe.servings} servings · scales automatically
                  </p>
                </div>

                <div className="bg-surface-soft border border-tertiary-fixed rounded-xl p-4 flex flex-col gap-3">
                  {reassurances.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-on-secondary-container">
                      <CheckCircle2 size={18} className="text-success-veg" />
                      <span className="text-label-md">{item}</span>
                    </div>
                  ))}
                </div>

                <NutritionCard nutrition={recipe.nutrition} />

                <div className="flex flex-col gap-2 pt-2 border-t border-border-light">
                  <div className="flex justify-between items-center">
                    <span className="font-display text-lg text-on-surface font-bold">
                      Total Ingredients
                    </span>
                    <span className="font-display text-lg text-on-surface font-bold">
                      {recipe.scaledIngredients?.length ?? 0} Items
                    </span>
                  </div>
                  <p className="text-body-md text-label-sm text-on-surface-variant">
                    Everything you need, pre-measured for {recipe.servings} servings.
                  </p>
                  <Button
                    size="xl"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full justify-between mt-1"
                    onClick={handleGetIngredients}
                  >
                    Get Ingredients · ₹{recipe.scaledIngredients?.reduce((sum, i) => sum + (i.packOptimization?.totalPrice || 0), 0).toLocaleString('en-IN') ?? 349}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-label-sm text-on-surface-variant">
                    <Sparkles size={14} className="text-success-veg" />
                    Free delivery · Pantry savings applied automatically
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* More recipes */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl md:text-[32px] font-bold text-on-surface">
            You might also love
          </h2>
          <Link to="/recipes" className="text-label-md text-success-veg font-semibold hover:underline">
            See all recipes
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedRecipes.map((r) => (
            <RecipeCard
              key={r.recipeId}
              recipe={{
                id: r.recipeId,
                slug: r.slug,
                name: r.name,
                image: r.image,
                cardImage: r.image,
                time: { total: r.totalTime },
                difficulty: r.difficulty,
                calories: r.calories ?? null,
                isVeg: r.isVeg,
                price: r.estimatedCost ?? 0,
              }}
              variant="discovery"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
