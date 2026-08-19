import { searchRecipes, searchIngredients, searchProducts } from '../api/recipeApi.js';
import { normalizeSearchQuery, getSearchSuggestions, getAutocompleteSuggestions } from '../utils/searchUtils.js';
import { normalizeRecipeForDisplay, estimateBaseCost } from './recipeService.js';

async function safeSearch(searchFn, query, label) {
  try {
    return await searchFn(query);
  } catch (error) {
    console.error(`Search failed for ${label}:`, error);
    return [];
  }
}

export async function search(query) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return { recipes: [], ingredients: [], products: [], topMatch: null };

  const [rawRecipes, ingredients, products] = await Promise.all([
    safeSearch(searchRecipes, normalized, 'recipes'),
    safeSearch(searchIngredients, normalized, 'ingredients'),
    safeSearch(searchProducts, normalized, 'products'),
  ]);

  const recipes = rawRecipes.map((recipe) => normalizeRecipeForDisplay(recipe));

  let topMatch = null;
  if (recipes.length > 0) {
    const top = { ...recipes[0] };
    top.estimatedCost = await estimateBaseCost(rawRecipes[0]);
    topMatch = { type: 'recipe', data: top };
  } else if (ingredients.length > 0) {
    topMatch = { type: 'ingredient', data: ingredients[0] };
  } else if (products.length > 0) {
    topMatch = { type: 'product', data: products[0] };
  }

  return {
    recipes: recipes.slice(0, 10),
    ingredients: ingredients.slice(0, 10),
    products: products.slice(0, 10),
    topMatch,
  };
}

export async function searchWithIntent(query) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return { recipes: [], ingredients: [], products: [], intent: null };

  const { recipes, ingredients, products, topMatch } = await search(normalized);

  let intent = 'unknown';
  if (topMatch?.type === 'recipe') intent = 'dish';
  else if (topMatch?.type === 'ingredient') intent = 'product';
  else if (topMatch?.type === 'product') intent = 'product';

  return { recipes, ingredients, products, topMatch, intent };
}

export async function getRecipeSearchResults(query, limit = 20) {
  const normalized = normalizeSearchQuery(query);
  const recipes = await searchRecipes(normalized);
  return recipes.slice(0, limit);
}

export async function getIngredientSearchResults(query, limit = 10) {
  const normalized = normalizeSearchQuery(query);
  const ingredients = await searchIngredients(normalized);
  return ingredients.slice(0, limit);
}

export async function getProductSearchResults(query, limit = 20) {
  const normalized = normalizeSearchQuery(query);
  const products = await searchProducts(normalized);
  return products.slice(0, limit);
}

export async function getAutocompleteData(query, allRecipes, allAliases) {
  return getAutocompleteSuggestions(query, allRecipes, allAliases);
}

export async function getSearchSuggestionsForQuery(query, recipes, ingredients, products) {
  return getSearchSuggestions(query, recipes, ingredients, products);
}

export function isRecipeSearchResult(result) {
  return result && result.type === 'recipe';
}

export function isIngredientSearchResult(result) {
  return result && result.type === 'ingredient';
}

export function isProductSearchResult(result) {
  return result && result.type === 'product';
}