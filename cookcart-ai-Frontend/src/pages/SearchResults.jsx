import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import RecipeHero from '../components/recipe/RecipeHero.jsx'
import Chip from '../components/common/Chip.jsx'
import { useCart } from '../hooks/useCart.js'
import { fadeUp, staggerContainer } from '../utils/animations.js'
import { searchWithIntent } from '../services/searchService.js'
import SmartImage from '../components/common/SmartImage.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

const capitalize = (value = '') =>
  value.replace(/^\w/, (c) => c.toUpperCase())

export default function SearchResults() {
  const [params] = useSearchParams()
  const { query: pathQuery } = useParams()
  const query = (params.get('q') ?? pathQuery ?? '').trim()
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchResults, setSearchResults] = useState({ recipes: [], ingredients: [], products: [], topMatch: null, intent: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem } = useCart()
  const abortControllerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    
    async function doSearch() {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      if (!query) {
        setSearchResults({ recipes: [], ingredients: [], products: [], topMatch: null, intent: null })
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const results = await searchWithIntent(query)
        if (!cancelled && !controller.signal.aborted) setSearchResults(results)
      } catch (searchError) {
        if (searchError.name === 'AbortError') return
        console.error('CookCart search failed:', searchError)
        if (!cancelled && !controller.signal.aborted) {
          setSearchResults({ recipes: [], ingredients: [], products: [], topMatch: null, intent: null })
          setError('We could not search right now. Please try again.')
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) setLoading(false)
      }
    }
    doSearch()
    return () => { 
      cancelled = true 
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query])

  const { products, topMatch, intent } = searchResults

  const categoryOptions = useMemo(
    () => ['All', ...[...new Set(products.map((p) => p.category).filter(Boolean))].sort()],
    [products],
  )

  const results = products.filter((product) =>
    activeFilter === 'All' ? true : product.category === activeFilter,
  )

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <p className="text-label-sm text-on-surface-variant mb-2">
          Showing results for
        </p>
        <h1 className="font-display text-3xl md:text-[40px] font-bold text-on-surface tracking-tight">
          {query ? `“${query}”` : 'Start with a dish or ingredient'}
        </h1>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent" />
        </div>
      ) : error ? (
        <EmptyState title="Search unavailable" description={error} />
      ) : topMatch?.type === 'recipe' && topMatch.data ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          <RecipeHero recipe={topMatch.data} />
        </motion.div>
      ) : topMatch?.type === 'ingredient' && topMatch.data ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          <div className="bg-surface rounded-2xl border border-border-light p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-on-surface">{topMatch.data.canonical_name || topMatch.data.display_name}</h2>
            <p className="text-body-md text-on-surface-variant mt-2">Found as ingredient. Search for recipes using this ingredient.</p>
          </div>
        </motion.div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-light p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-on-surface">No recipe match yet</h2>
          <p className="text-body-md text-on-surface-variant mt-2">Try Paneer Butter Masala, Biryani, Pav Bhaji, or Pasta.</p>
        </div>
      )}

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col gap-5"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <h2 className="font-display text-2xl md:text-[28px] font-bold text-on-surface">
            {intent === 'product' ? 'Related Products' : 'More results'}
          </h2>
          <span className="text-label-sm text-on-surface-variant">{results.length} items</span>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categoryOptions.map((filter) => (
            <Chip
              key={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {capitalize(filter)}
            </Chip>
          ))}
        </motion.div>

        {results.length === 0 ? (
          <EmptyState
            title="No products match"
            description="Try a different category or search for another dish or ingredient."
          />
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((product, index) => (
            <motion.div
              key={product.sku_id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-surface-container-lowest rounded-xl p-3 shadow-card-soft flex flex-col relative group"
            >
              <div className="absolute top-2 left-2 z-10">
                <span
                  className={`w-3 h-3 border flex items-center justify-center rounded-sm bg-white ${
                    product.vegetarian ? 'border-success-veg' : 'border-error'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      product.vegetarian ? 'bg-success-veg' : 'bg-error'
                    }`}
                  />
                </span>
              </div>
              <div className="aspect-square bg-cheese-bg rounded-lg mb-3 relative overflow-hidden">
                <SmartImage
                  src={product.image}
                  alt={product.product_name}
                  kind="product"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-label-md text-on-surface line-clamp-2 leading-tight">
                  {product.product_name}
                </h4>
                <p className="text-label-sm text-on-surface-variant mt-1">{product.pack_size}{product.unit}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-label-md text-on-surface font-bold">₹{product.price}</p>
                  {product.mrp > product.price && (
                    <p className="text-label-sm text-on-surface-variant line-through">
                      ₹{product.mrp}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Add ${product.product_name} to cart`}
                  onClick={() => addItem({ ...product, quantity: 1 })}
                  className="w-8 h-8 rounded-full border border-success-veg text-success-veg flex items-center justify-center hover:bg-success-veg hover:text-white transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </motion.section>
    </div>
  )
}
