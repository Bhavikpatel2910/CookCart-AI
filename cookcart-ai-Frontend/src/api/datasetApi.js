// Core catalog data (recipes, ingredients, products) now comes from the real
// Express + MongoDB backend — see cookcart-ai-Backend. During `npm run dev`,
// vite.config.js proxies /api/* to the backend so this works with no CORS
// setup. In production, set VITE_API_BASE_URL to the deployed backend's
// public /api URL.
//
// Everything else (substitutions, recommendations, favorites, orders, search
// aliases, etc.) is still demo/mock data served from /public/dataset — the
// backend doesn't model those collections yet (Phase 2/3 per the PRD), so
// they stay local for now rather than silently going empty.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const DATASET_BASE_URL = '/dataset';

let datasetCache = null;
let loadingPromise = null;

async function fetchJSON(url, { optional = false } = {}) {
  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    if (optional) return [];
    throw new Error(`Failed to reach ${url}: ${networkError.message}`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('json')) {
    if (optional) return [];
    throw new Error(`${url} is unavailable or is not JSON (${response.status})`);
  }
  try {
    return await response.json();
  } catch {
    if (optional) return [];
    throw new Error(`${url} contains invalid JSON`);
  }
}

// Backend list endpoints return { recipes: [...] } / { ingredients: [...] } /
// { products: [...] } — unwrap to the plain array datasetApi consumers expect.
async function fetchBackendList(resource, key) {
  const data = await fetchJSON(`${API_BASE_URL}/${resource}`);
  return Array.isArray(data) ? data : (data[key] ?? []);
}

function normalizeRecipe(recipe) {
  const prepTimeMinutes = recipe.prep_time_minutes ?? recipe.prep_time ?? recipe.prepTime ?? 0;
  const cookTimeMinutes = recipe.cook_time_minutes ?? recipe.cook_time ?? recipe.cookTime ?? 0;
  const totalTimeMinutes =
    recipe.total_time_minutes ?? recipe.totalTime ?? (prepTimeMinutes + cookTimeMinutes);
  return {
    ...recipe,
    recipe_id: recipe.recipe_id || recipe._id,
    base_servings: recipe.base_servings || recipe.baseServings || 1,
    prep_time: prepTimeMinutes,
    cook_time: cookTimeMinutes,
    prep_time_minutes: prepTimeMinutes,
    cook_time_minutes: cookTimeMinutes,
    total_time_minutes: totalTimeMinutes,
    diet_type: recipe.diet_type || recipe.dietType,
    imageUrl: recipe.imageUrl || recipe.image,
    ingredients: (recipe.ingredients || []).map((item) => ({
      ...item,
      ingredient_id: item.ingredient_id || item.ingredientId,
      base_quantity: item.base_quantity ?? item.quantity ?? 0,
      scaling_rule: item.scaling_rule || item.scalingRule || 'linear',
    })),
  };
}

function normalizeIngredient(ingredient) {
  return {
    ...ingredient,
    ingredient_id: ingredient.ingredient_id || ingredient._id,
    canonical_name: ingredient.canonical_name || ingredient.canonicalName || ingredient.name,
    display_name: ingredient.display_name || ingredient.displayName || ingredient.canonicalName || ingredient.name,
    aliases: ingredient.aliases || [],
    search_keywords: ingredient.search_keywords || [],
  };
}

function normalizeProduct(product) {
  return {
    ...product,
    sku_id: product.sku_id || product._id,
    product_name: product.product_name || product.name,
    ingredient_id: product.ingredient_id || product.ingredientId,
    pack_size: product.pack_size ?? product.packSize ?? 1,
    price: Number(product.price) || 0,
    imageUrl: product.imageUrl || product.image,
    inventory: product.inventory && typeof product.inventory === 'object'
      ? product.inventory
      : { in_stock: Number(product.inventory ?? 0) > 0, quantity: Number(product.inventory ?? 0) },
  };
}

export async function loadDataset() {
  if (datasetCache) return datasetCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      let rawRecipes, rawIngredients, rawProducts;
      try {
        // Primary source: the real backend (MongoDB via Express API)
        [rawRecipes, rawIngredients, rawProducts] = await Promise.all([
          fetchBackendList('recipes', 'recipes'),
          fetchBackendList('ingredients', 'ingredients'),
          fetchBackendList('products', 'products'),
        ]);
      } catch (backendError) {
        // Fallback: local static demo dataset, so the app still runs (e.g.
        // during frontend-only development) if the backend isn't up.
        console.warn(
          `Backend unreachable (${backendError.message}), falling back to local demo dataset.`,
        );
        [rawRecipes, rawIngredients, rawProducts] = await Promise.all([
          fetchJSON(`${DATASET_BASE_URL}/recipes.json`),
          fetchJSON(`${DATASET_BASE_URL}/ingredients.json`),
          fetchJSON(`${DATASET_BASE_URL}/products.json`),
        ]);
      }

      const recipes = rawRecipes.map(normalizeRecipe);
      const ingredients = rawIngredients.map(normalizeIngredient);
      const rawProductList = rawProducts.map(normalizeProduct);

      // Products almost never have their own photo (image/imageUrl is null
      // in the seed data) — they're just a specific SKU of an ingredient, so
      // fall back to that ingredient's real local photo instead of letting
      // downstream code fall through to a generic/unrelated stock image.
      const ingredientImageById = new Map(
        ingredients.map((ingredient) => [ingredient.ingredient_id, ingredient.imageUrl || ingredient.image]),
      );
      const products = rawProductList.map((product) => ({
        ...product,
        imageUrl: product.imageUrl || ingredientImageById.get(product.ingredient_id) || null,
      }));

      const inventory = products.map((product) => ({
        sku_id: product.sku_id,
        in_stock: product.inventory?.in_stock !== false,
        quantity: product.inventory?.quantity ?? 0,
      }));
      const optionalFiles = [
        'substitutions.json', 'users.json', 'pantry.json', 'recipe_sessions.json',
        'carts.json', 'orders.json', 'favorites.json', 'recently_cooked.json',
        'recommendations.json', 'search_aliases.json', 'search_intents.json',
        'serving_test_cases.json', 'pack_optimization_test_cases.json',
        'dataset_summary.json', 'validation_report.json',
      ];
      const optional = await Promise.all(
        optionalFiles.map((file) => fetchJSON(`${DATASET_BASE_URL}/${file}`, { optional: true })),
      );
      const [substitutions, users, pantry, recipeSessions, carts, orders, favorites,
        recentlyCooked, recommendations, searchAliases, searchIntents,
        servingTestCases, packOptimizationTestCases, datasetSummary, validationReport] = optional;
      datasetCache = {
        recipes, ingredients, products, inventory, substitutions, users, pantry,
        recipeSessions, carts, orders, favorites, recentlyCooked, recommendations,
        searchAliases, searchIntents, servingTestCases, packOptimizationTestCases,
        datasetSummary, validationReport,
      };
      return datasetCache;
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();
  return loadingPromise;
}

export function getDataset() { return datasetCache; }
export function clearDatasetCache() { datasetCache = null; loadingPromise = null; }
