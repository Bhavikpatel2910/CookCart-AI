import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Users } from 'lucide-react'
import IngredientCard from '../components/recipe/IngredientCard.jsx'
import ChangeProductSheet from '../components/recipe/ChangeProductSheet.jsx'
import { useRecipe } from '../hooks/useRecipe.js'
import { useCart } from '../hooks/useCart.js'
import { usePantry } from '../hooks/usePantry.js'
import { fadeUp } from '../utils/animations.js'
import { formatCurrency } from '../utils/helpers.js'

export default function IngredientReview() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { activeRecipe, servings, replaceIngredientProduct, selectRecipe, loading, error } = useRecipe()
  const { addRecipeIngredients, items, removeItem, addItem } = useCart()
  const { pantryItems: userPantryItems } = usePantry()
  const [sheet, setSheet] = useState(null)
  const [continuing, setContinuing] = useState(false)
  const continuingRef = useRef(false)

  useEffect(() => {
    const targetSlug = slug || (!activeRecipe ? 'aloo-paratha' : null)
    if (targetSlug && (!activeRecipe || activeRecipe.slug !== targetSlug)) {
      selectRecipe(targetSlug)
    }
  }, [slug, activeRecipe, selectRecipe])

  if (!activeRecipe && loading) {
    return <div className="max-w-page mx-auto px-4 md:px-8 py-20 text-center text-on-surface-variant">Loading ingredients…</div>
  }

  if (error && !activeRecipe) {
    return <div className="max-w-page mx-auto px-4 md:px-8 py-20 text-center text-error">{error}</div>
  }

  const ingredients = activeRecipe?.scaledIngredients || []

  if (!activeRecipe) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-3">Choose a recipe first</h1>
        <p className="text-body-md text-on-surface-variant mb-7">
          Pick a dish and CookCart will create your measured ingredient list.
        </p>
        <button
          type="button"
          onClick={() => navigate('/recipes')}
          className="rounded-2xl bg-success-veg px-6 py-3 text-label-md font-semibold text-white"
        >
          Browse recipes
        </button>
      </div>
    )
  }

  // Create a set of ingredient IDs that are in the user's pantry
  const pantryIngredientIds = new Set(userPantryItems.map(item => item.ingredientId))
  
  // Filter ingredients: shopping items (not in pantry, not pantry staples) and pantry items
  const shoppingIngredients = ingredients.filter(item => !item.isPantryStaple && !pantryIngredientIds.has(item.ingredientId))
  const pantryIngredients = ingredients.filter(item => item.isPantryStaple || pantryIngredientIds.has(item.ingredientId))

  const total = shoppingIngredients.reduce(
    (sum, item) => sum + (item.packOptimization?.totalPrice || 0),
    0,
  )
  const itemCount = shoppingIngredients.reduce((sum, item) => sum + (item.packOptimization?.packCount || 1), 0)
  const availability = shoppingIngredients.every((item) => item.inventory?.inStock !== false)

  const handleContinue = async () => {
    if (continuingRef.current) return
    continuingRef.current = true
    setContinuing(true)
    try {
      await addRecipeIngredients(shoppingIngredients, activeRecipe?.recipe_id)
      navigate('/cart')
    } finally {
      setContinuing(false)
      continuingRef.current = false
    }
  }

  const handleSelectProduct = async (alt) => {
    if (!sheet || !alt) return
    setSheet(null)
    const oldSku = sheet.product?.skuId
    await replaceIngredientProduct(sheet.ingredientId, alt.skuId)
    // If this ingredient is already in the cart, swap the product line.
    const existing = items.find((item) => item.skuId === oldSku)
    if (existing) {
      removeItem(oldSku)
      addItem({
        skuId: alt.skuId,
        name: alt.name,
        brand: alt.brand,
        packSize: `${alt.packSize}${alt.unit}`,
        unit: alt.unit,
        price: alt.price,
        mrp: alt.mrp,
        image: alt.image,
        quantity: existing.quantity,
        isVeg: true,
        recipeId: activeRecipe?.recipe_id,
        ingredientId: sheet.ingredientId,
      })
    }
  }

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl md:text-[40px] font-bold text-on-surface mb-1">
            {activeRecipe?.name}
          </h2>
          <p className="text-body-md text-on-surface-variant flex items-center gap-1.5">
            <Users size={18} /> {servings} people · Review each ingredient before it goes in your basket
          </p>
        </div>
        <div className={`bg-surface-soft px-4 py-2 rounded-lg border flex items-center gap-2 w-fit ${availability ? 'border-success-veg/20' : 'border-error/20'}`}>
          <CheckCircle2 size={18} className={availability ? 'text-success-veg' : 'text-error'} />
          <div>
            <p className="text-label-md text-on-surface">
              {shoppingIngredients.length}/{ingredients.filter(i => !i.isPantryStaple).length} to buy
            </p>
            <p className={`text-label-sm ${availability ? 'text-success-veg' : 'text-error'}`}>
              {availability ? 'READY TO COOK' : 'SUBSTITUTIONS NEEDED'}
            </p>
          </div>
        </div>
      </motion.div>

      <section className="mb-10">
        <h3 className="font-display text-2xl font-bold text-on-surface mb-4 border-b border-border-light pb-2">
          Ingredients to Buy
        </h3>
        {shoppingIngredients.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border-light p-8 text-center">
            <p className="text-body-md text-on-surface-variant">All ingredients are in your pantry!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shoppingIngredients.map((item) => (
              <IngredientCard
                key={item.ingredientId}
                ingredient={{
                  id: item.ingredientId,
                  name: item.ingredientName,
                  required: `${item.requiredQuantity}${item.requiredUnit}`,
                  requiredQuantity: item.requiredQuantity,
                  quantity: item.packOptimization?.packCount || 1,
                  product: item.product,
                  image: item.product?.image || item.ingredientImage,
                  bg: 'bg-cheese-bg',
                  category: item.ingredientCategory,
                  available: item.inventory?.inStock !== false,
                }}
                variant="review"
                onOpenChangeSheet={() => setSheet(item)}
              />
            ))}
          </div>
        )}
      </section>

      {pantryIngredients.length > 0 && (
        <section className="mb-10">
          <h3 className="font-display text-2xl font-bold text-on-surface mb-4 border-b border-border-light pb-2">
            Pantry & Spices (Already in your kitchen)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantryIngredients.map((item) => (
              <IngredientCard
                key={item.ingredientId}
                ingredient={{
                  id: item.ingredientId,
                  name: item.ingredientName,
                  required: `${item.requiredQuantity}${item.requiredUnit}`,
                  requiredQuantity: item.requiredQuantity,
                  quantity: 0,
                  product: item.product,
                  image: item.product?.image || item.ingredientImage,
                  bg: 'bg-surface-container-low',
                  category: item.ingredientCategory,
                  available: true,
                }}
                variant="review"
              />
            ))}
          </div>
        </section>
      )}

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-border-light shadow-[0_-20px_40px_rgba(0,0,0,0.08)] p-4 z-40">
        <div className="max-w-page mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-label-sm text-on-surface-variant">Total for Recipe</span>
            <span className="font-display text-headline-md text-on-surface font-bold">
              {formatCurrency(total)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            disabled={continuing || shoppingIngredients.length === 0}
            className={`w-full sm:w-auto text-label-md font-semibold py-3.5 px-8 rounded-[16px] shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 active:scale-95 ${
              continuing ? 'opacity-70 cursor-wait' : 'bg-success-veg text-on-primary'
            }`}
          >
            {continuing ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                Adding to cart...
              </>
            ) : (
              <>
                Continue with {itemCount} items
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <ChangeProductSheet
        open={!!sheet}
        ingredient={sheet}
        onClose={() => setSheet(null)}
        onSelect={handleSelectProduct}
      />
    </div>
  )
}
