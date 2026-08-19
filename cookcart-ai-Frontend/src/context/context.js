import { createContext, useContext } from 'react'

export const CartContext = createContext(null)
export const RecipeContext = createContext(null)
export const PantryContext = createContext(null)
export const UserContext = createContext(null)
export const AuthContext = createContext(null)

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCartContext must be used within a CartProvider')
  return context
}

export function useRecipeContext() {
  const context = useContext(RecipeContext)
  if (!context) throw new Error('useRecipeContext must be used within a RecipeProvider')
  return context
}

export function usePantryContext() {
  const context = useContext(PantryContext)
  if (!context) throw new Error('usePantryContext must be used within a PantryProvider')
  return context
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUserContext must be used within a UserProvider')
  return context
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')
  return context
}
