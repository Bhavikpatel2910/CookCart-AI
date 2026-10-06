import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { getCartFromStorage, saveCartToStorage } from '../api/cartApi.js';
import { saveCartToServer } from '../api/userApi.js';
import { useAuth as useAuthState } from '../hooks/useAuth.js';
import { calculateCartTotal } from '../utils/priceUtils.js';
import {
  normalizeCartItem,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  setItemPantryStatus,
  clearCart,
  getCartItemCount,
  getCartItemTypes,
  addRecipeIngredientsToCart,
} from '../services/cartService.js';
import { CartContext } from './context.js';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => getCartFromStorage());
  const [hydrated, setHydrated] = useState(false);
  const addingRef = useRef(new Set())
  const { user: authUser, serverUser, syncStatus } = useAuthState()
  const userId = authUser?.user_id ?? null
  // The server cart is merged once per signed-in user; pushes only start after that.
  const mergedForRef = useRef(null)
  const [serverReady, setServerReady] = useState(false)

  useEffect(() => {
    setItems(getCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCartToStorage(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((item) => {
    const skuId = item.skuId ?? item.id
    if (!skuId || addingRef.current.has(skuId)) return
    
    addingRef.current.add(skuId)
    setItems(current => addItemToCart(current, item))
    toast.success(`${item.productName || item.name} added to cart`)
    
    setTimeout(() => {
      addingRef.current.delete(skuId)
    }, 500)
  }, []);

  const removeItem = useCallback((skuId) => {
    setItems(current => removeItemFromCart(current, skuId));
  }, []);

  const updateQuantity = useCallback((skuId, delta) => {
    setItems(current => {
      const item = current.find(i => i.skuId === skuId);
      if (!item) return current;
      return updateItemQuantity(current, skuId, item.quantity + delta);
    });
  }, []);

  const setQuantity = useCallback((skuId, quantity) => {
    setItems(current => updateItemQuantity(current, skuId, quantity));
  }, []);

  const setPantry = useCallback((skuId, fromPantry) => {
    setItems(current => setItemPantryStatus(current, skuId, fromPantry));
  }, []);

  const clearCartItems = useCallback(() => {
    setItems(clearCart());
  }, []);

  // When the user's DB record arrives, merge their saved cart into the local one.
  useEffect(() => {
    if (!hydrated) return
    if (!userId) {
      // Signed out: don't leave the previous user's basket on this device.
      if (mergedForRef.current) setItems([])
      mergedForRef.current = null
      setServerReady(false)
      return
    }
    if (syncStatus !== 'synced' || !serverUser || mergedForRef.current === userId) return
    mergedForRef.current = userId
    const remote = (serverUser.cart || []).map((raw) => normalizeCartItem(raw)).filter(Boolean)
    setItems((local) => {
      const merged = [...local]
      for (const item of remote) {
        if (!merged.some((m) => m.skuId === item.skuId)) merged.push(item)
      }
      return merged
    })
    setServerReady(true)
  }, [hydrated, userId, syncStatus, serverUser])

  // Keep the database copy of the cart up to date (debounced).
  useEffect(() => {
    if (!serverReady || !userId) return undefined
    const timer = setTimeout(() => {
      saveCartToServer(userId, items).catch((error) =>
        console.warn('Could not save cart to the database:', error?.message),
      )
    }, 800)
    return () => clearTimeout(timer)
  }, [items, serverReady, userId])

  const addRecipeIngredients = useCallback(
    async (scaledIngredients, recipeId, { silent = false } = {}) => {
      // Re-adding the same recipe replaces its lines instead of doubling them.
      const base = recipeId ? items.filter((item) => item.recipeId !== recipeId) : items;
      const updated = await addRecipeIngredientsToCart(base, scaledIngredients, recipeId);
      setItems(updated);
      if (!silent) toast.success('Recipe ingredients added to cart');
      return updated;
    },
    [items],
  );

  const itemCount = useMemo(() => getCartItemCount(items), [items]);
  const itemTypes = useMemo(() => getCartItemTypes(items), [items]);
  const totals = useMemo(() => calculateCartTotal(items, { deliveryOption: 'standard', includePackaging: true }), [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    setQuantity,
    setPantry,
    clearCart: clearCartItems,
    addRecipeIngredients,
    itemCount,
    itemTypes,
    totals,
    hydrated,
  }), [
    items,
    addItem,
    removeItem,
    updateQuantity,
    setQuantity,
    setPantry,
    clearCartItems,
    addRecipeIngredients,
    itemCount,
    itemTypes,
    totals,
    hydrated,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
