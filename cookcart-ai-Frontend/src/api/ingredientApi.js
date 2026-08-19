import { loadDataset } from './datasetApi.js';

function buildIngredientIndex(ingredients) {
  const byId = new Map();
  for (const ingredient of ingredients) {
    byId.set(ingredient.ingredient_id, ingredient);
  }
  return { byId };
}

let ingredientIndex = null;

async function ensureIndex() {
  if (ingredientIndex) return ingredientIndex;
  const dataset = await loadDataset();
  ingredientIndex = buildIngredientIndex(dataset.ingredients);
  return ingredientIndex;
}

export async function getAllIngredients() {
  const dataset = await loadDataset();
  return dataset.ingredients;
}

export async function getIngredientById(ingredientId) {
  const index = await ensureIndex();
  return index.byId.get(ingredientId) || null;
}

export async function getIngredientByName(name) {
  const index = await ensureIndex();
  for (const ingredient of index.byId.values()) {
    if (ingredient.canonical_name.toLowerCase() === name.toLowerCase() ||
        ingredient.display_name.toLowerCase() === name.toLowerCase()) {
      return ingredient;
    }
  }
  return null;
}

export async function getIngredientsByIds(ingredientIds) {
  const index = await ensureIndex();
  return ingredientIds.map(id => index.byId.get(id)).filter(Boolean);
}

export async function getIngredientsByCategory(category) {
  const index = await ensureIndex();
  return [...index.byId.values()].filter(i => i.category === category);
}

export async function getPantryStaples() {
  const index = await ensureIndex();
  return [...index.byId.values()].filter(i => i.common_pantry_item);
}