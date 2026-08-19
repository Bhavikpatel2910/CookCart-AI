import { useCallback, useMemo, useState } from 'react';
import { useContext } from 'react';
import { getRecipeWithServings, applySkuOverride } from '../services/recipeService.js';
import { getServingOptions } from '../services/servingService.js';
import { RecipeContext } from './context.js';

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}

export function RecipeProvider({ children }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const [servings, setServings] = useState(4);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // User-selected product overrides: { [ingredientId]: skuId }.
  const [overrides, setOverrides] = useState({});

  const servingOptions = useMemo(() => getServingOptions(), []);

  const applyAllOverrides = useCallback(
    async (recipe, ovr) => {
      let next = recipe;
      for (const [ingredientId, skuId] of Object.entries(ovr)) {
        next = await applySkuOverride(next, ingredientId, skuId);
      }
      return next;
    },
    [],
  );

  const selectRecipe = useCallback(
    async (slug) => {
      setActiveSlug(slug);
      setOverrides({});
      setLoading(true);
      setError(null);
      try {
        const baseRecipe = await getRecipeWithServings(slug, 1);
        const baseServings = baseRecipe?.baseServings || 4;
        setServings(baseServings);
        const recipe = await getRecipeWithServings(slug, baseServings);
        if (!recipe) {
          setError('This recipe is unavailable. Try one of our other dishes.');
        }
        setActiveRecipe(recipe);
      } catch (error) {
        console.error('Failed to load recipe:', error);
        setActiveRecipe(null);
        setError('We could not load this recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const changeServings = useCallback(
    async (newServings) => {
      const parsed = Number(newServings);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 20) {
        return;
      }
      if (parsed === servings) return;
      setServings(parsed);
      if (!activeSlug) return;
      setLoading(true);
      try {
        const recipe = await getRecipeWithServings(activeSlug, parsed);
        setActiveRecipe(await applyAllOverrides(recipe, overrides));
      } catch (error) {
        console.error('Failed to scale recipe:', error);
      } finally {
        setLoading(false);
      }
    },
    [activeSlug, servings, overrides, applyAllOverrides],
  );

  // Swap the product for one ingredient; keeps the choice across re-renders.
  const replaceIngredientProduct = useCallback(
    async (ingredientId, skuId) => {
      const nextOverrides = { ...overrides, [ingredientId]: skuId };
      setOverrides(nextOverrides);
      setLoading(true);
      try {
        const recipe = await getRecipeWithServings(activeSlug, servings);
        setActiveRecipe(await applyAllOverrides(recipe, nextOverrides));
      } finally {
        setLoading(false);
      }
    },
    [activeSlug, servings, overrides, applyAllOverrides],
  );

  const value = useMemo(
    () => ({
      activeRecipe,
      activeSlug,
      selectRecipe,
      servings,
      setServings: changeServings,
      servingOptions,
      loading,
      error,
      replaceIngredientProduct,
    }),
    [activeRecipe, activeSlug, selectRecipe, servings, changeServings, servingOptions, loading, error, replaceIngredientProduct],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}
