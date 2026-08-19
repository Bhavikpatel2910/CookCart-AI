import { loadDataset } from './datasetApi.js';

function buildRecommendationIndex(recommendations) {
  const bySource = new Map();
  for (const rec of recommendations) {
    if (!bySource.has(rec.source_recipe_id)) {
      bySource.set(rec.source_recipe_id, []);
    }
    bySource.get(rec.source_recipe_id).push(rec);
  }
  return bySource;
}

let recommendationIndex = null;

async function ensureIndex() {
  if (recommendationIndex) return recommendationIndex;
  const dataset = await loadDataset();
  recommendationIndex = buildRecommendationIndex(dataset.recommendations);
  return recommendationIndex;
}

export async function getRecommendationsForRecipe(sourceRecipeId, limit = 5) {
  const index = await ensureIndex();
  const recs = index.bySource.get(sourceRecipeId) || [];
  return recs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getAllRecommendations() {
  const dataset = await loadDataset();
  return dataset.recommendations;
}