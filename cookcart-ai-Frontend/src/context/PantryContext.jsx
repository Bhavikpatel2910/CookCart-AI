import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContext } from 'react';
import { getAllUsers } from '../api/userApi.js';
import { getAllIngredients } from '../api/ingredientApi.js';
import { getProductsByIngredient } from '../api/productApi.js';
import { getCurrentUserFromStorage } from '../api/userApi.js';
import { getProductImageUrl, getIngredientImageUrl } from '../utils/imageUtils.js';
import { PantryContext } from './context.js';

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}

const PANTRY_STORAGE_KEY = 'cookcart_pantry';

const CATEGORY_BG_MAP = {
  'Dairy': 'bg-cheese-bg',
  'Vegetables': 'bg-tomato-bg',
  'Spices': 'bg-capsicum-bg',
  'Grains': 'bg-surface-container-low',
  'Oils': 'bg-cheese-bg',
  'Condiments': 'bg-surface-soft',
};

async function enrichPantryItems(rawItems) {
  const ingredients = await getAllIngredients();
  const ingredientMap = new Map(ingredients.map(i => [i.ingredient_id, i]));
  
  const enriched = await Promise.all(rawItems.map(async (item) => {
    const ingredient = ingredientMap.get(item.ingredientId);
    const products = await getProductsByIngredient(item.ingredientId);
    const product = products[0];
    
    return {
      id: item.ingredientId,
      ingredientId: item.ingredientId,
      ingredientName: ingredient?.canonical_name || item.ingredientId,
      name: ingredient?.canonical_name || item.ingredientId,
      quantity: item.quantity || 1,
      unit: item.unit || 'pack',
      inPantry: item.inPantry !== false,
      price: product?.price || 0,
      image: product?.image
        ? getProductImageUrl(product)
        : getIngredientImageUrl(ingredient || { name: item.ingredientId }),
      bg: ingredient ? CATEGORY_BG_MAP[ingredient.category] || 'bg-surface-container-low' : 'bg-surface-container-low',
      category: ingredient?.category || 'Pantry',
    };
  }));
  
  return enriched;
}

function getDefaultPantryItems(ingredients) {
  const pantryStaples = ingredients.filter(i => i.common_pantry_item);
  return pantryStaples.slice(0, 8).map(ingredient => ({
    ingredientId: ingredient.ingredient_id,
    ingredientName: ingredient.canonical_name,
    quantity: 1,
    unit: 'pack',
    inPantry: true,
  }));
}

export function PantryProvider({ children }) {
  const [items, setItems] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      const user = getCurrentUserFromStorage();
      let rawItems = [];

      // Respect the prototype's persisted pantry first.  Older/malformed data
      // is ignored so a bad localStorage entry can never stop the app loading.
      try {
        const saved = JSON.parse(localStorage.getItem(PANTRY_STORAGE_KEY) || '[]');
        if (Array.isArray(saved)) rawItems = saved.filter(item => item?.ingredientId);
      } catch {
        rawItems = [];
      }
      
      if (rawItems.length === 0 && user) {
        const users = await getAllUsers();
        const userData = users.find(u => u.user_id === user.user_id || u.email === user.email);
        if (userData?.pantry_items?.length) {
          rawItems = userData.pantry_items.map(p => ({
            ingredientId: p.ingredient_id,
            ingredientName: p.ingredient_id,
            quantity: p.quantity,
            unit: p.unit,
            inPantry: true,
          }));
        }
      }
      
      if (rawItems.length === 0) {
        const ingredients = await getAllIngredients();
        rawItems = getDefaultPantryItems(ingredients);
      }
      
      const enriched = await enrichPantryItems(rawItems);
      setItems(enriched);
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(rawItems));
      setInitialized(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (initialized) {
      const rawItems = items.map(item => ({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unit: item.unit,
        inPantry: item.inPantry,
      }));
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(rawItems));
    }
  }, [items, initialized]);

  const toggleItem = useCallback((id) => {
    setItems(current =>
      current.map(item =>
        item.id === id ? { ...item, inPantry: !item.inPantry } : item
      )
    );
  }, []);

  const setItemQuantity = useCallback((id, quantity, unit) => {
    setItems(current =>
      current.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, quantity), unit: unit || item.unit }
          : item
      )
    );
  }, []);

  const addPantryItem = useCallback(async (ingredientId, ingredientName, quantity = 1, unit = 'pack') => {
    const ingredients = await getAllIngredients();
    const ingredient = ingredients.find(i => i.ingredient_id === ingredientId);
    const products = await getProductsByIngredient(ingredientId);
    const product = products[0];
    
    const newItem = {
      id: ingredientId,
      ingredientId,
      ingredientName: ingredient?.canonical_name || ingredientName,
      name: ingredient?.canonical_name || ingredientName,
      quantity,
      unit,
      inPantry: true,
      price: product?.price || 0,
      image: product?.image
        ? getProductImageUrl(product)
        : getIngredientImageUrl(ingredient || { name: ingredientName }),
      bg: ingredient ? CATEGORY_BG_MAP[ingredient.category] || 'bg-surface-container-low' : 'bg-surface-container-low',
      category: ingredient?.category || 'Pantry',
    };
    
    setItems(current => {
      if (current.some(item => item.id === ingredientId)) {
        return current.map(item =>
          item.id === ingredientId
            ? { ...item, quantity: item.quantity + quantity, inPantry: true }
            : item
        );
      }
      return [...current, newItem];
    });
  }, []);

  const removePantryItem = useCallback((id) => {
    setItems(current => current.filter(item => item.id !== id));
  }, []);

  const pantryItems = useMemo(() => items.filter(item => item.inPantry), [items]);
  const nonPantryItems = useMemo(() => items.filter(item => !item.inPantry), [items]);

  const savings = useMemo(
    () => pantryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [pantryItems],
  );

  const pantryCount = useMemo(() => pantryItems.length, [pantryItems]);

  const value = useMemo(() => ({
    items,
    pantryItems,
    nonPantryItems,
    toggleItem,
    setItemQuantity,
    addPantryItem,
    removePantryItem,
    initialized,
    savings,
    pantryCount,
  }), [items, pantryItems, nonPantryItems, toggleItem, setItemQuantity, addPantryItem, removePantryItem, initialized, savings, pantryCount]);

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}
