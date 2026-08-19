import { searchRecipes, searchIngredients, searchProducts } from '../api/recipeApi.js';

export async function searchAll(query) {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return { recipes: [], ingredients: [], products: [] };

  const [recipes, ingredients, products] = await Promise.all([
    searchRecipes(normalized),
    searchIngredients(normalized),
    searchProducts(normalized),
  ]);

  return { recipes, ingredients, products };
}

// Normalization must only fix unambiguous typos and never rewrite terms that
// are legitimate recipe/product names (e.g. "masala", "dal", "roti" are real
// words in the dataset). Broader alias/abbr expansion is handled by the
// dataset's search_aliases.json and search_intents.json, not here.
export function normalizeSearchQuery(query) {
  return String(query)
    .toLowerCase()
    .trim()
    .replace(/\bspinner\b/g, 'spinach')
    .replace(/\bpanner\b/g, 'paneer')
    .replace(/\s+/g, ' ')
    .trim();
}

export function highlightMatch(text, query) {
  if (!query) return text;
  const normalized = normalizeSearchQuery(query);
  const words = normalized.split(/\s+/).filter(w => w.length > 1);
  let result = text;
  for (const word of words) {
    const regex = new RegExp(`(${word})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }
  return result;
}

export function getSearchSuggestions(query, recipes, ingredients, products, limit = 5) {
  const normalized = normalizeSearchQuery(query);
  const suggestions = [];

  for (const recipe of recipes) {
    const haystack = `${recipe.name} ${(recipe.tags || []).join(' ')} ${recipe.cuisine || ''}`.toLowerCase();
    if (haystack.includes(normalized)) {
      suggestions.push({
        type: 'recipe',
        id: recipe.recipe_id,
        label: recipe.name,
        subtitle: `${recipe.cuisine} • ${recipe.total_time_minutes} min`,
        image: recipe.image,
      });
    }
  }

  for (const ingredient of ingredients) {
    const haystack = `${ingredient.canonical_name} ${(ingredient.aliases || []).join(' ')}`.toLowerCase();
    if (haystack.includes(normalized)) {
      suggestions.push({
        type: 'ingredient',
        id: ingredient.ingredient_id,
        label: ingredient.canonical_name,
        subtitle: ingredient.category,
      });
    }
  }

  return suggestions.slice(0, limit);
}

export function getAutocompleteSuggestions(query, recipes, aliases) {
  const normalized = normalizeSearchQuery(query);
  if (normalized.length < 2) return [];

  const suggestions = new Set();

  for (const recipe of recipes) {
    if (recipe.name.toLowerCase().includes(normalized)) {
      suggestions.add(recipe.name);
    }
    for (const alias of recipe.search_aliases || []) {
      if (alias.toLowerCase().includes(normalized)) {
        suggestions.add(alias);
      }
    }
  }

  for (const alias of aliases) {
    if (alias.alias.toLowerCase().includes(normalized)) {
      suggestions.add(alias.canonical_query);
    }
  }

  return [...suggestions].slice(0, 8);
}