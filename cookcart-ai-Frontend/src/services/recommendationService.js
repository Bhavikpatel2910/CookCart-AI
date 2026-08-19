import { getRecommendationsForRecipe } from '../api/recommendationApi.js';
import { getRecipeById } from '../api/recipeApi.js';

export async function getRecommendationsForDisplay(sourceRecipeId, limit = 5) {
  const recommendations = await getRecommendationsForRecipe(sourceRecipeId, limit);
  
  const recipesWithDetails = await Promise.all(
    recommendations.map(async (rec) => {
      const recipe = await getRecipeById(rec.recommended_recipe_id);
      if (!recipe) return null;
      
      return {
        recommendationId: rec.recommendation_id,
        sourceRecipeId: rec.source_recipe_id,
        recipe: {
          recipeId: recipe.recipe_id,
          slug: recipe.slug,
          name: recipe.name,
          description: recipe.description,
          image: recipe.image,
          totalTime: recipe.total_time_minutes,
          difficulty: recipe.difficulty,
          dietType: recipe.diet_type,
          cuisine: recipe.cuisine,
          tags: recipe.tags,
        },
        reason: rec.reason,
        score: rec.score,
      };
    })
  );

  return recipesWithDetails.filter(Boolean);
}

export async function getRecentlyCookedRecommendations(userId, _limit = 5) {
  return [];
}

export async function getFavoriteBasedRecommendations(userId, _limit = 5) {
  return [];
}

export async function getSimilarCuisineRecommendations(recipeId, limit = 5) {
  const recommendations = await getRecommendationsForRecipe(recipeId, limit);
  return recommendations.filter(r => r.reason === 'Similar cuisine');
}

export async function getPopularPairingRecommendations(recipeId, limit = 5) {
  const recommendations = await getRecommendationsForRecipe(recipeId, limit);
  return recommendations.filter(r => r.reason === 'Popular pairing');
}

export async function getSimilarTimeRecommendations(recipeId, limit = 5) {
  const recommendations = await getRecommendationsForRecipe(recipeId, limit);
  return recommendations.filter(r => r.reason === 'Similar cooking time');
}