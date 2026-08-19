import { Navigate, useLocation } from 'react-router-dom'
import { useRecipe } from '../../hooks/useRecipe.js'
import { useCart } from '../../hooks/useCart.js'

export function RecipeGuard({ children }) {
  const { activeRecipe, activeSlug, loading, error } = useRecipe()
  const location = useLocation()

  if (loading) {
    return (
      <div className="max-w-page mx-auto px-4 md:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-success-veg border-t-transparent mx-auto" />
      </div>
    )
  }

  if (error || !activeRecipe || !activeSlug) {
    return (
      <Navigate to="/recipes" state={{ from: location }} replace />
    )
  }

  return children
}

export function CartGuard({ children }) {
  const { items } = useCart()
  const location = useLocation()

  if (!items.length) {
    return (
      <Navigate to="/cart" state={{ from: location }} replace />
    )
  }

  return children
}