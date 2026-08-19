import {
  getRecipeById,
  getRecipeBySlug,
  getAllRecipes,
  getIngredientById,
  getProductsByIngredient,
  getInventoryBySku,
  getSubstitutionsForIngredient,
  getProductBySku,
} from '../api/recipeApi.js';
import {
  scaleIngredientQuantity,
  calculateMultiplePackOptions,
  getRecommendedPackOption,
  calculatePackOptimization,
} from '../utils/quantityUtils.js';
import { getRecipeImageUrl, getProductImageUrl } from '../utils/imageUtils.js';

export { getRecipeBySlug } from '../api/recipeApi.js';

function isVegOf(recipe) {
  return (recipe?.diet_type || '').toLowerCase() !== 'non-vegetarian';
}

function normStep(step) {
  return {
    stepNumber: step.step_number,
    title: step.title,
    description: step.description,
    time: step.duration_minutes,
    tips: step.tips,
    timerRequired: step.timer_required,
    type: step.type,
  };
}

function normNutrition(n) {
  if (!n) return null;
  return {
    basis: n.basis,
    calories: n.calories,
    protein: n.protein_g,
    carbs: n.carbs_g,
    fat: n.fat_g,
    fiber: n.fiber_g,
  };
}

// Maps a raw dataset recipe to the display model consumed by pages/components.
// Preserves every raw snake_case field and adds the camelCase + UI convenience
// fields the UI expects. Image paths are resolved to real, existing assets.
export function normalizeRecipeForDisplay(recipe) {
  if (!recipe) return null;
  return {
    ...recipe,
    recipeId: recipe.recipe_id,
    slug: recipe.slug,
    name: recipe.name,
    image: getRecipeImageUrl(recipe),
    time: {
      prep: recipe.prep_time_minutes,
      cook: recipe.cook_time_minutes,
      total: recipe.total_time_minutes,
    },
    totalTime: recipe.total_time_minutes,
    prepTime: recipe.prep_time_minutes,
    cookTime: recipe.cook_time_minutes,
    difficulty: recipe.difficulty,
    dietType: recipe.diet_type,
    cuisine: recipe.cuisine,
    mealType: recipe.meal_type,
    dishCategory: recipe.dish_category,
    spiceLevel: recipe.spice_level,
    isJain: recipe.is_jain,
    isVeg: isVegOf(recipe),
    veg: isVegOf(recipe),
    calories: recipe.nutrition?.calories ?? null,
    rating: recipe.rating ?? null,
    steps: (recipe.steps || []).map(normStep),
    chefTips: (recipe.tips || []).map((t) => (typeof t === 'string' ? { tip: t } : t)),
    nutrition: normNutrition(recipe.nutrition),
  };
}

// Build a product + inventory + pack model for one ingredient, choosing the
// cheapest in-stock pack that satisfies the required quantity.
async function resolveIngredientProducts(ingredientId, requiredQuantity, unit) {
  const ingredient = await getIngredientById(ingredientId);
  const products = await getProductsByIngredient(ingredientId);

  const options = calculateMultiplePackOptions(requiredQuantity, unit, products);
  const inStockOptions = [];
  for (const option of options) {
    const inventory = await getInventoryBySku(option.skuId);
    option.inventory = inventory;
    if (inventory?.in_stock) inStockOptions.push(option);
  }
  // Fall back to any option if nothing is in stock (still show, marked out).
  const pool = inStockOptions.length ? inStockOptions : options;
  const recommended = getRecommendedPackOption(pool, requiredQuantity) || null;

  const recommendedInventory = recommended ? await getInventoryBySku(recommended.skuId) : null;
  const productBySku = new Map(products.map((product) => [product.sku_id, product]));

  const toProduct = (opt) => {
    const rawProduct = productBySku.get(opt.skuId);
    return {
      skuId: opt.skuId,
      name: opt.productName,
      brand: opt.brand,
      packSize: opt.packSize,
      unit: opt.unit,
      price: opt.price,
      mrp: opt.mrp,
      image: getProductImageUrl(rawProduct),
      vegetarian: rawProduct?.vegetarian ?? true,
    };
  };

  const recommendedProduct = recommended ? toProduct(recommended) : null;

  return {
    ingredient,
    product: recommendedProduct,
    inventory: recommendedInventory
      ? {
          inStock: recommendedInventory.in_stock,
          lowStock: recommendedInventory.low_stock,
          availableQuantity: recommendedInventory.available_quantity,
          status: recommendedInventory.status,
        }
      : null,
    packOptimization: recommended
      ? {
          packCount: recommended.packCount,
          buyingQuantity: recommended.buyingQuantity,
          buyingUnit: recommended.buyingUnit,
          totalPrice: recommended.totalPrice,
          excessQuantity: recommended.excessQuantity,
          excessUnit: recommended.excessUnit,
          unitPrice: recommended.unitPrice,
        }
      : null,
    alternatives: pool
      .filter((o) => o.skuId !== recommended?.skuId)
      .slice(0, 4)
      .map((o) => ({
        skuId: o.skuId,
        name: o.productName,
        brand: o.brand,
        packSize: o.packSize,
        unit: o.unit,
        price: o.price,
        mrp: o.mrp,
        image: getProductImageUrl({ sku_id: o.skuId, name: o.productName, product_name: o.productName }),
        inStock: Boolean(o.inventory?.in_stock),
        lowStock: Boolean(o.inventory?.low_stock),
        packCount: o.packCount,
      })),
  };
}

async function loadDisplayRecipe(recipeIdOrSlug) {
  const recipe = (await getRecipeById(recipeIdOrSlug)) || (await getRecipeBySlug(recipeIdOrSlug));
  return recipe ? normalizeRecipeForDisplay(recipe) : null;
}

export async function getRecipeForDisplay(recipeIdOrSlug) {
  const recipe = await loadDisplayRecipe(recipeIdOrSlug);
  if (!recipe) return null;

  const baseServings = recipe.base_servings || 1;
  const ratio = baseServings / baseServings; // base view
  const ingredients = await Promise.all(
    (recipe.ingredients || []).map(async (ingRef) => scaleOneIngredient(ingRef, ratio)),
  );
  return { ...recipe, servings: baseServings, baseServings, scaledIngredients: ingredients };
}

async function scaleOneIngredient(ingRef, ratio) {
  const requiredQuantity = scaleIngredientQuantity(
    ingRef.quantity,
    ratio,
    ingRef.scaling_rule || 'linear',
  );
  const unit = ingRef.unit || '';
  const {
    ingredient,
    product,
    inventory,
    packOptimization,
    alternatives,
  } = await resolveIngredientProducts(ingRef.ingredient_id, requiredQuantity, unit);

  return {
    ingredientId: ingRef.ingredient_id,
    ingredientName: ingredient?.canonical_name || ingRef.ingredient_id,
    ingredientCategory: ingredient?.category,
    isPantryStaple: Boolean(ingRef.pantry_staple),
    required: Boolean(ingRef.required),
    critical: Boolean(ingRef.critical),
    optional: Boolean(ingRef.optional),
    preparation: ingRef.preparation || '',
    notes: ingRef.notes || '',
    scalingRule: ingRef.scaling_rule || 'linear',
    requiredQuantity,
    requiredUnit: unit,
    baseQuantity: ingRef.quantity,
    baseUnit: unit,
    requiredQuantityText: `${requiredQuantity}${unit}`,
    buyingQuantityText: packOptimization ? `${packOptimization.buyingQuantity}${packOptimization.buyingUnit}` : `${requiredQuantity}${unit}`,
    packCount: packOptimization?.packCount ?? 1,
    product,
    inventory,
    packOptimization,
    alternatives,
    scalingRatio: ratio,
  };
}

export async function getRecipeWithServings(recipeIdOrSlug, servings) {
  const recipe = await loadDisplayRecipe(recipeIdOrSlug);
  if (!recipe) return null;

  const baseServings = recipe.base_servings || 1;
  const ratio = servings / baseServings;
  const scaledIngredients = await Promise.all(
    (recipe.ingredients || []).map((ingRef) => scaleOneIngredient(ingRef, ratio)),
  );

  return {
    ...recipe,
    servings,
    baseServings,
    scaledIngredients,
  };
}

export async function getSubstitutionsForScaledIngredient(ingredientId) {
  return (await getSubstitutionsForIngredient(ingredientId)) || [];
}

// Product model for a specific SKU at a required quantity (for product swaps).
export async function getSkuProductModel(skuId, requiredQuantity, unit) {
  const product = await getProductBySku(skuId);
  if (!product) return { product: null, inventory: null, packOptimization: null };
  const inventory = await getInventoryBySku(skuId);
  const pack = calculatePackOptimization(
    requiredQuantity,
    unit,
    product.pack_size,
    product.unit,
    product.price,
  );
  return {
    product: {
      skuId: product.sku_id,
      name: product.product_name,
      brand: product.brand,
      packSize: product.pack_size,
      unit: product.unit,
      price: product.price,
      mrp: product.mrp,
      image: getProductImageUrl(product),
      vegetarian: true,
    },
    inventory: inventory
      ? {
          inStock: inventory.in_stock,
          lowStock: inventory.low_stock,
          availableQuantity: inventory.available_quantity,
          status: inventory.status,
        }
      : null,
    packOptimization: pack,
  };
}

// Force a specific SKU for a scaled ingredient (used by the Change Product sheet).
export async function applySkuOverride(recipe, ingredientId, skuId) {
  if (!recipe?.scaledIngredients) return recipe;
  const ing = recipe.scaledIngredients.find((i) => i.ingredientId === ingredientId);
  if (!ing) return recipe;
  const { product, inventory, packOptimization } = await getSkuProductModel(
    skuId,
    ing.requiredQuantity,
    ing.requiredUnit,
  );
  const scaledIngredients = recipe.scaledIngredients.map((i) =>
    i.ingredientId === ingredientId
      ? {
          ...i,
          product,
          inventory,
          packOptimization,
          packCount: packOptimization?.packCount ?? i.packCount,
          buyingQuantityText: packOptimization
            ? `${packOptimization.buyingQuantity}${packOptimization.buyingUnit}`
            : i.buyingQuantityText,
        }
      : i,
  );
  return { ...recipe, scaledIngredients };
}

export async function getAllRecipesForListing() {
  const recipes = await getAllRecipes();
  return Promise.all(
    recipes.map(async (recipe) => {
      const display = normalizeRecipeForDisplay(recipe);
      const estimatedCost = await estimateBaseCost(recipe);
      return { ...display, estimatedCost };
    }),
  );
}

// Rough "from ₹" for listing cards: sum the cheapest pack covering each
// non-pantry ingredient at the recipe's base servings.
export async function estimateBaseCost(recipe) {
  const baseServings = recipe.base_servings || 1;
  let total = 0;
  for (const ingRef of recipe.ingredients || []) {
    if (ingRef.pantry_staple) continue;
    const products = await getProductsByIngredient(ingRef.ingredient_id);
    const options = calculateMultiplePackOptions(ingRef.quantity, ingRef.unit, products);
    const recommended = getRecommendedPackOption(options, ingRef.quantity);
    if (recommended) total += recommended.totalPrice;
  }
  void baseServings;
  return Math.round(total);
}

export async function getFeaturedRecipes(limit = 4) {
  const recipes = await getAllRecipesForListing();
  const featured = recipes.filter((r) => r.tags?.includes('popular'));
  return (featured.length ? featured : recipes).slice(0, limit);
}

export async function getQuickRecipes(maxMinutes = 30) {
  const recipes = await getAllRecipesForListing();
  return recipes
    .filter((r) => r.totalTime <= maxMinutes)
    .sort((a, b) => a.totalTime - b.totalTime);
}

export async function getRecipesByCategory(category) {
  const recipes = await getAllRecipesForListing();
  return recipes.filter((r) => r.dishCategory === category || r.cuisine === category);
}

export async function getRecipesByCuisine(cuisine) {
  const recipes = await getAllRecipesForListing();
  return recipes.filter((r) => r.cuisine === cuisine);
}

export async function getRecipesByMealType(mealType) {
  const recipes = await getAllRecipesForListing();
  return recipes.filter((r) => r.mealType === mealType);
}

export async function getRecipesByDifficulty(difficulty) {
  const recipes = await getAllRecipesForListing();
  return recipes.filter((r) => r.difficulty === difficulty);
}

export async function getRecipesByDiet(diet) {
  const recipes = await getAllRecipesForListing();
  return recipes.filter((r) => r.dietType === diet);
}

export async function getRecipesBySpiceLevel(spiceLevel) {
  const recipes = await getAllRecipesForListing();
  return recipes.filter((r) => r.spiceLevel === spiceLevel);
}

export function filterRecipes(recipes, filters) {
  return recipes.filter((recipe) => {
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;
    if (filters.mealType && recipe.mealType !== filters.mealType) return false;
    if (filters.dishCategory && recipe.dishCategory !== filters.dishCategory) return false;
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
    if (filters.diet && recipe.dietType !== filters.diet) return false;
    if (filters.spiceLevel && recipe.spiceLevel !== filters.spiceLevel) return false;
    if (filters.maxTime && recipe.totalTime > filters.maxTime) return false;
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => recipe.tags?.includes(tag))) return false;
    }
    if (filters.isVeg !== undefined && recipe.dietType === 'Non-Vegetarian' && filters.isVeg) return false;
    if (filters.isJain && !recipe.isJain) return false;
    return true;
  });
}
