import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { getCartFromStorage, saveCartToStorage } from '../api/cartApi.js';
import { calculateCartTotal } from '../utils/priceUtils.js';
import {
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

  const addRecipeIngredients = useCallback(
    async (scaledIngredients, recipeId) => {
      const updated = await addRecipeIngredientsToCart(items, scaledIngredients, recipeId);
      setItems(updated);
      toast.success('Recipe ingredients added to cart');
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
