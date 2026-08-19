const API_BASE_URL = '/dataset';

let datasetCache = null;
let loadingPromise = null;

async function fetchJSON(filename, { optional = false } = {}) {
  const response = await fetch(`${API_BASE_URL}/${filename}`);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('json')) {
    if (optional) return [];
    throw new Error(`Dataset file ${filename} is unavailable or is not JSON (${response.status})`);
  }
  try {
    return await response.json();
  } catch {
    if (optional) return [];
    throw new Error(`Dataset file ${filename} contains invalid JSON`);
  }
}

function normalizeRecipe(recipe) {
  return {
    ...recipe,
    recipe_id: recipe.recipe_id || recipe._id,
    base_servings: recipe.base_servings || recipe.baseServings || 1,
    prep_time: recipe.prep_time || recipe.prepTime || 0,
    cook_time: recipe.cook_time || recipe.cookTime || 0,
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
      const [rawRecipes, rawIngredients, rawProducts] = await Promise.all([
        fetchJSON('recipes.json'),
        fetchJSON('ingredients.json'),
        fetchJSON('products.json'),
      ]);
      const recipes = rawRecipes.map(normalizeRecipe);
      const ingredients = rawIngredients.map(normalizeIngredient);
      const products = rawProducts.map(normalizeProduct);
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
      const optional = await Promise.all(optionalFiles.map((file) => fetchJSON(file, { optional: true })));
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
