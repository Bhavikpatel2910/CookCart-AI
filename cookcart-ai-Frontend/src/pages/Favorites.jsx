import { useEffect, useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import RecipeCard from '../components/recipe/RecipeCard.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'

const FAVORITES_STORAGE_KEY = 'cookcart_favorites'

export default function Favorites() {
  const navigate = useNavigate()
  const { recipes } = useApp()
  const [savedSlugs, setSavedSlugs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(savedSlugs))
  }, [savedSlugs])

  const remove = (slug) => {
    const next = savedSlugs.filter((id) => id !== slug)
    setSavedSlugs(next)
  }

  const savedRecipes = recipes.filter((recipe) => savedSlugs.includes(recipe.slug))

  return (
    <div className="max-w-page mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="mb-8">
        <p className="text-label-sm text-success-veg font-semibold">YOUR COLLECTION</p>
        <h1 className="font-display text-4xl font-bold text-on-surface mt-1">Saved recipes</h1>
        <p className="text-body-md text-on-surface-variant mt-2">Keep your next delicious idea one tap away.</p>
      </div>
      {savedRecipes.length === 0 ? (
        <EmptyState icon={Heart} title="No saved recipes yet" description="Save a recipe from its overview and it will appear here." actionLabel="Explore recipes" onAction={() => navigate('/recipes')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedRecipes.map((recipe) => (
            <div key={recipe.recipeId} className="relative">
              <RecipeCard
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
              />
              <button
                type="button"
                aria-label={`Remove ${recipe.name}`}
                onClick={() => remove(recipe.slug)}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 text-error flex items-center justify-center shadow"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}