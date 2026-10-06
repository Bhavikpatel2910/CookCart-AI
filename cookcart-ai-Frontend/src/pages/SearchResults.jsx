import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Flame, Plus, SearchX, Star, UtensilsCrossed } from 'lucide-react'
import Chip from '../components/common/Chip.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import SmartImage from '../components/common/SmartImage.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useCart } from '../hooks/useCart.js'
import { fadeUp, staggerContainer } from '../utils/animations.js'
import { searchWithIntent } from '../services/searchService.js'
import { formatCurrency } from '../utils/helpers.js'

const EMPTY = { recipes: [], ingredients: [], products: [], topMatch: null, intent: null }

const capitalize = (value = '') => value.replace(/^\w/, (c) => c.toUpperCase())

function SectionHeading({ title, count, hint }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="font-display text-2xl md:text-[28px] font-bold text-on-surface leading-tight">{title}</h2>
        {hint && <p className="text-body-md text-on-surface-variant mt-1">{hint}</p>}
      </div>
      {count != null && (
        <span className="shrink-0 text-label-sm font-semibold text-on-surface-variant bg-white border border-border-light rounded-full px-3 py-1">
          {count} {count === 1 ? 'result' : 'results'}
        </span>
      )}
    </div>
  )
}

// The best recipe match: image on one side, details + actions on the other.
function TopRecipeMatch({ recipe }) {
  const metaChips = [
    recipe.time?.total != null && { icon: Clock, label: `${recipe.time.total} min` },
    recipe.difficulty && { icon: Flame, label: recipe.difficulty },
    recipe.calories != null && { icon: Flame, label: `${recipe.calories} kcal` },
  ].filter(Boolean)

  return (
    <article className="card-surface overflow-hidden grid grid-cols-1 md:grid-cols-5">
      <Link to={`/recipe/${recipe.slug}`} className="relative md:col-span-2 block h-56 md:h-auto md:min-h-[300px] overflow-hidden group">
        <SmartImage
          src={recipe.image}
          alt={recipe.name}
          kind="recipe"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 text-on-surface text-label-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${recipe.isVeg ? 'border-success-veg' : 'border-error'}`}
          >
            <span className={`w-1 h-1 rounded-full ${recipe.isVeg ? 'bg-success-veg' : 'bg-error'}`} />
          </span>
          {recipe.isVeg ? 'Veg' : 'Non-veg'}
        </span>
      </Link>

      <div className="md:col-span-3 p-6 md:p-8 flex flex-col gap-4">
        <span className="section-eyebrow">Best match</span>
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface leading-tight">{recipe.name}</h2>
          {recipe.description && (
            <p className="text-body-md text-on-surface-variant mt-2 line-clamp-3 max-w-2xl">{recipe.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {recipe.cuisine && (
            <span className="inline-flex items-center gap-1.5 bg-saffron-soft text-saffron font-semibold text-label-sm px-3 py-1.5 rounded-full">
              <UtensilsCrossed size={14} /> {recipe.cuisine}
            </span>
          )}
          {metaChips.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 bg-surface-container-low text-on-surface text-label-sm px-3 py-1.5 rounded-full">
              <Icon size={14} className="text-on-surface-variant" /> {label}
            </span>
          ))}
          {recipe.rating && (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-low text-on-surface text-label-sm px-3 py-1.5 rounded-full">
              <Star size={14} className="text-warning fill-warning" /> {recipe.rating}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-label-sm text-on-surface-variant">All ingredients from</p>
            <p className="font-display text-3xl font-bold text-on-surface">
              {recipe.estimatedCost != null ? formatCurrency(recipe.estimatedCost) : '—'}
            </p>
          </div>
          <Link
            to={`/recipe/${recipe.slug}`}
            className="btn-gradient text-white text-label-md font-semibold px-6 py-3.5 rounded-2xl shadow-glow-green hover:shadow-glow-green-lg hover:-translate-y-0.5 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
          >
            View recipe &amp; get ingredients <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function ProductCard({ product, onAdd }) {
  const hasDiscount = product.mrp > product.price
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="group h-full bg-white rounded-2xl border border-border-light/70 p-3 shadow-card-soft hover:shadow-card-hover transition-shadow flex flex-col"
    >
      <div className="relative aspect-square rounded-xl bg-cheese-bg overflow-hidden mb-3">
        <SmartImage
          src={product}
          alt={product.product_name}
          kind="product"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-2 left-2 w-4 h-4 bg-white border rounded-sm flex items-center justify-center ${
            product.vegetarian === false ? 'border-error' : 'border-success-veg'
          }`}
          title={product.vegetarian === false ? 'Non-veg' : 'Veg'}
        >
          <span className={`w-2 h-2 rounded-full ${product.vegetarian === false ? 'bg-error' : 'bg-success-veg'}`} />
        </span>
      </div>

      <div className="flex-1 px-0.5">
        <h3 className="text-label-md text-on-surface font-semibold line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.product_name}
        </h3>
        <p className="text-label-sm text-on-surface-variant mt-1">
          {product.pack_size}
          {product.unit}
          {product.brand ? ` · ${product.brand}` : ''}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-border-light/70 flex items-center justify-between gap-2">
        <div className="leading-tight">
          <p className="text-label-md font-bold text-on-surface">{formatCurrency(product.price)}</p>
          {hasDiscount && <p className="text-label-sm text-on-surface-variant line-through">{formatCurrency(product.mrp)}</p>}
        </div>
        <button
          type="button"
          aria-label={`Add ${product.product_name} to cart`}
          onClick={() => onAdd(product)}
          className="shrink-0 inline-flex items-center gap-1 pl-3 pr-3.5 h-9 rounded-full border border-success-veg text-success-veg text-label-sm font-bold hover:bg-success-veg hover:text-white active:scale-95 transition-colors"
        >
          <Plus size={16} /> ADD
        </button>
      </div>
    </motion.div>
  )
}

export default function SearchResults() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { query: pathQuery } = useParams()
  const query = (params.get('q') ?? pathQuery ?? '').trim()
  const [draft, setDraft] = useState(query)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchResults, setSearchResults] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem } = useCart()
  const requestRef = useRef(0)

  useEffect(() => setDraft(query), [query])

  useEffect(() => {
    const requestId = ++requestRef.current
    const isCurrent = () => requestRef.current === requestId

    async function doSearch() {
      setActiveFilter('All')
      if (!query) {
        setSearchResults(EMPTY)
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const results = await searchWithIntent(query)
        if (isCurrent()) setSearchResults(results)
      } catch (searchError) {
        console.error('CookCart search failed:', searchError)
        if (isCurrent()) {
          setSearchResults(EMPTY)
          setError('We could not search right now. Please try again.')
        }
      } finally {
        if (isCurrent()) setLoading(false)
      }
    }
    doSearch()
    return () => {
      requestRef.current += 1
    }
  }, [query])

  const { products, recipes, topMatch } = searchResults
  const topRecipe = topMatch?.type === 'recipe' ? topMatch.data : null
  const moreRecipes = useMemo(
    () => recipes.filter((r) => r.slug !== topRecipe?.slug).slice(0, 6),
    [recipes, topRecipe],
  )

  const categoryOptions = useMemo(
    () => ['All', ...[...new Set(products.map((p) => p.category).filter(Boolean))].sort()],
    [products],
  )
  const filteredProducts = products.filter((p) => activeFilter === 'All' || p.category === activeFilter)

  const nothingFound = !loading && !error && query && !topMatch && products.length === 0
  const recipeCount = recipes.length
  const summary = [
    recipeCount ? `${recipeCount} recipe${recipeCount === 1 ? '' : 's'}` : null,
    products.length ? `${products.length} product${products.length === 1 ? '' : 's'}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-10">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-5">
        <div>
          <p className="section-eyebrow">Search results</p>
          <h1 className="font-display text-3xl md:text-[40px] font-bold text-on-surface leading-tight mt-1">
            {query ? <>Results for “{query}”</> : 'Start with a dish or ingredient'}
          </h1>
          {summary && !loading && <p className="text-body-md text-on-surface-variant mt-1">{summary}</p>}
        </div>
        <div className="max-w-2xl">
          <SearchBar
            value={draft}
            onChange={setDraft}
            onSubmit={(value) => value && navigate(`/search?q=${encodeURIComponent(value)}`)}
            placeholder="Search for products or dishes"
          />
        </div>
      </motion.header>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 h-56">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
          <p className="text-label-md text-on-surface-variant">Finding the best matches…</p>
        </div>
      ) : error ? (
        <EmptyState title="Search unavailable" description={error} />
      ) : nothingFound ? (
        <EmptyState
          icon={SearchX}
          title="No matches found"
          description="Try a dish like Dal Tadka, Masala Dosa or Veg Burger — or search for an ingredient such as paneer or tomato."
          actionLabel="Browse all recipes"
          onAction={() => navigate('/recipes')}
        />
      ) : (
        <>
          {topRecipe && (
            <motion.section variants={fadeUp} initial="hidden" animate="show">
              <TopRecipeMatch recipe={topRecipe} />
            </motion.section>
          )}

          {topMatch?.type === 'ingredient' && topMatch.data && (
            <section className="card-surface p-6 md:p-8 flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-success-veg/10 text-success-veg flex items-center justify-center shrink-0">
                <UtensilsCrossed size={22} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  {topMatch.data.canonical_name || topMatch.data.display_name}
                </h2>
                <p className="text-body-md text-on-surface-variant">Showing the products we stock for this ingredient.</p>
              </div>
            </section>
          )}

          {moreRecipes.length > 0 && (
            <section>
              <SectionHeading title="More recipes you might like" hint="Similar dishes you can cook at home" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {moreRecipes.map((r, index) => (
                  <RecipeCard
                    key={r.recipeId}
                    delay={index * 0.05}
                    recipe={{
                      id: r.recipeId,
                      slug: r.slug,
                      name: r.name,
                      image: r.image,
                      cardImage: r.image,
                      time: { total: r.totalTime },
                      difficulty: r.difficulty,
                      isVeg: r.isVeg,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {products.length > 0 && (
            <motion.section variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionHeading
                title={topRecipe ? 'Related products' : 'Products'}
                count={filteredProducts.length}
              />
              {categoryOptions.length > 2 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mt-1 mb-2">
                  {categoryOptions.map((filter) => (
                    <Chip key={filter} active={activeFilter === filter} onClick={() => setActiveFilter(filter)}>
                      {capitalize(filter)}
                    </Chip>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 items-stretch">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.sku_id}
                    product={product}
                    onAdd={(p) => addItem({ ...p, skuId: p.sku_id, name: p.product_name, quantity: 1 })}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}
    </div>
  )
}
