import { loadDataset } from './datasetApi.js';

function buildRecipeIndex(recipes) {
  const byId = new Map();
  const bySlug = new Map();
  for (const recipe of recipes) {
    byId.set(recipe.recipe_id, recipe);
    bySlug.set(recipe.slug, recipe);
  }
  return { byId, bySlug };
}

function buildIngredientIndex(ingredients) {
  const byId = new Map();
  for (const ingredient of ingredients) {
    byId.set(ingredient.ingredient_id, ingredient);
  }
  return { byId };
}

function buildProductIndex(products) {
  const bySku = new Map();
  const byIngredient = new Map();
  for (const product of products) {
    bySku.set(product.sku_id, product);
    if (!byIngredient.has(product.ingredient_id)) {
      byIngredient.set(product.ingredient_id, []);
    }
    byIngredient.get(product.ingredient_id).push(product);
  }
  return { bySku, byIngredient };
}

function buildInventoryIndex(inventory) {
  const bySku = new Map();
  for (const item of inventory) {
    bySku.set(item.sku_id, item);
  }
  return { bySku };
}

function buildSubstitutionIndex(substitutions) {
  const byIngredient = new Map();
  for (const sub of substitutions) {
    if (!byIngredient.has(sub.ingredient_id)) {
      byIngredient.set(sub.ingredient_id, []);
    }
    byIngredient.get(sub.ingredient_id).push(sub);
  }
  return { byIngredient };
}

function buildSearchIndex(recipes, ingredients, products, searchAliases, searchIntents) {
  const recipeIndex = new Map();
  const ingredientIndex = new Map();
  const productIndex = new Map();

  for (const recipe of recipes) {
    const terms = [
      recipe.name.toLowerCase(),
      recipe.slug.toLowerCase(),
      ...(recipe.search_aliases || []).map(a => a.toLowerCase()),
      ...(recipe.tags || []).map(t => t.toLowerCase()),
      recipe.cuisine?.toLowerCase(),
      recipe.meal_type?.toLowerCase(),
      recipe.dish_category?.toLowerCase(),
    ].filter(Boolean);

    for (const term of terms) {
      if (!recipeIndex.has(term)) recipeIndex.set(term, []);
      recipeIndex.get(term).push(recipe.recipe_id);
    }
  }

  for (const ingredient of ingredients) {
    const terms = [
      ingredient.canonical_name.toLowerCase(),
      ingredient.display_name.toLowerCase(),
      ...(ingredient.aliases || []).map(a => a.toLowerCase()),
      ...(ingredient.search_keywords || []).map(k => k.toLowerCase()),
      ...(ingredient.normalization_keywords || []).map(k => k.toLowerCase()),
    ].filter(Boolean);

    for (const term of terms) {
      if (!ingredientIndex.has(term)) ingredientIndex.set(term, []);
      ingredientIndex.get(term).push(ingredient.ingredient_id);
    }
  }

  for (const product of products) {
    const terms = [
      product.product_name.toLowerCase(),
      product.brand?.toLowerCase(),
      ...(product.search_keywords || []).map(k => k.toLowerCase()),
    ].filter(Boolean);

    for (const term of terms) {
      if (!productIndex.has(term)) productIndex.set(term, []);
      productIndex.get(term).push(product.sku_id);
    }
  }

  const aliasMap = new Map();
  for (const alias of searchAliases) {
    aliasMap.set(alias.alias.toLowerCase(), {
      entityType: alias.entity_type,
      entityId: alias.entity_id,
      canonicalQuery: alias.canonical_query,
    });
  }

  const intentMap = new Map();
  for (const intent of searchIntents) {
    intentMap.set(intent.query.toLowerCase(), intent);
  }

  return { recipeIndex, ingredientIndex, productIndex, aliasMap, intentMap };
}

let indexes = null;

async function ensureIndexes() {
  if (indexes) return indexes;
  const dataset = await loadDataset();
  indexes = {
    recipes: buildRecipeIndex(dataset.recipes),
    ingredients: buildIngredientIndex(dataset.ingredients),
    products: buildProductIndex(dataset.products),
    inventory: buildInventoryIndex(dataset.inventory),
    substitutions: buildSubstitutionIndex(dataset.substitutions),
    search: buildSearchIndex(
      dataset.recipes,
      dataset.ingredients,
      dataset.products,
      dataset.searchAliases,
      dataset.searchIntents
    ),
  };
  return indexes;
}

export async function getAllRecipes() {
  const dataset = await loadDataset();
  return dataset.recipes;
}

export async function getRecipeById(recipeId) {
  const { recipes } = await ensureIndexes();
  return recipes.byId.get(recipeId) || null;
}

export async function getRecipeBySlug(slug) {
  const { recipes } = await ensureIndexes();
  return recipes.bySlug.get(slug) || null;
}

export async function getRecipesByIds(recipeIds) {
  const { recipes } = await ensureIndexes();
  return recipeIds.map(id => recipes.byId.get(id)).filter(Boolean);
}

export async function getAllIngredients() {
  const dataset = await loadDataset();
  return dataset.ingredients;
}

export async function getIngredientById(ingredientId) {
  const { ingredients } = await ensureIndexes();
  return ingredients.byId.get(ingredientId) || null;
}

export async function getProductsByIngredient(ingredientId) {
  const { products } = await ensureIndexes();
  return products.byIngredient.get(ingredientId) || [];
}

export async function getProductBySku(skuId) {
  const { products } = await ensureIndexes();
  return products.bySku.get(skuId) || null;
}

export async function getInventoryBySku(skuId) {
  const { inventory } = await ensureIndexes();
  return inventory.bySku.get(skuId) || null;
}

export async function getSubstitutionsForIngredient(ingredientId) {
  const { substitutions } = await ensureIndexes();
  return substitutions.byIngredient.get(ingredientId) || [];
}

export async function searchRecipes(query) {
  const { search } = await ensureIndexes();
  const normalized = query.toLowerCase().trim();
  
  if (search.aliasMap.has(normalized)) {
    const alias = search.aliasMap.get(normalized);
    if (alias.entityType === 'recipe') {
      const recipe = await getRecipeById(alias.entityId);
      return recipe ? [recipe] : [];
    }
  }

  if (search.intentMap.has(normalized)) {
    const intent = search.intentMap.get(normalized);
    if (intent.intent === 'dish' && intent.entity_id) {
      const recipe = await getRecipeById(intent.entity_id);
      return recipe ? [recipe] : [];
    }
  }

  const recipeIds = new Set();
  const words = normalized.split(/\s+/);
  
  for (const word of words) {
    for (const [term, ids] of search.recipeIndex) {
      if (term.includes(word) || word.includes(term)) {
        for (const id of ids) recipeIds.add(id);
      }
    }
  }

  const recipes = await getRecipesByIds([...recipeIds]);
  
  recipes.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aExact = aName === normalized;
    const bExact = bName === normalized;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  return recipes;
}

export async function searchIngredients(query) {
  const indexes = await ensureIndexes();
  const { search, ingredients } = indexes;
  const normalized = query.toLowerCase().trim();
  const ingredientIds = new Set();
  const words = normalized.split(/\s+/);
  
  for (const word of words) {
    for (const [term, ids] of search.ingredientIndex) {
      if (term.includes(word) || word.includes(term)) {
        for (const id of ids) ingredientIds.add(id);
      }
    }
  }

  const byId = ingredients?.byId;
  if (!byId) {
    console.warn('Ingredients index not available');
    return [];
  }
  return [...ingredientIds].map(id => byId.get(id)).filter(Boolean);
}

export async function searchProducts(query) {
  const indexes = await ensureIndexes();
  const { search, products } = indexes;
  const normalized = query.toLowerCase().trim();
  const productIds = new Set();
  const words = normalized.split(/\s+/);
  
  for (const word of words) {
    for (const [term, ids] of search.productIndex) {
      if (term.includes(word) || word.includes(term)) {
        for (const id of ids) productIds.add(id);
      }
    }
  }

  const bySku = products?.bySku;
  if (!bySku) {
    console.warn('Products index not available');
    return [];
  }
  return [...productIds].map(id => bySku.get(id)).filter(Boolean);
}