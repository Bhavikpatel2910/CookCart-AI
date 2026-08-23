import Ingredient from "../models/Ingredient.js";

// FR-04 — Serving Scaling (deterministic, no AI)
// Base formula: newQuantity = baseQuantity × (requestedServings / baseServings)
// Spices/salt/oil don't scale linearly, so ingredients can opt into a
// dampened or fixed curve via `scalingRule` on the recipe's ingredient entry.

const MODERATE_DAMPENING = 0.75; // how much of the linear increase actually applies

export function applyScalingRule(baseQuantity, scaleFactor, scalingRule) {
  switch (scalingRule) {
    case "fixed":
      // Garnish-type amounts (e.g. a pinch of kasuri methi) don't grow with servings
      return baseQuantity;
    case "moderate":
      if (scaleFactor > 1) {
        const dampenedFactor = 1 + (scaleFactor - 1) * MODERATE_DAMPENING;
        return baseQuantity * dampenedFactor;
      }
      return baseQuantity * scaleFactor;
    case "linear":
    default:
      return baseQuantity * scaleFactor;
  }
}

// Legacy fallback for recipes seeded before `scalingRule` existed on the
// ingredient entry — infers a "moderate" curve from the ingredient's category.
function inferScalingRule(ingredientDoc) {
  if (
    ingredientDoc &&
    ["Spices", "Oil", "Salt"].includes(ingredientDoc.category)
  ) {
    return "moderate";
  }
  return "linear";
}

export class ServingEngine {
  static async scaleIngredients(recipe, requestedServings) {
    const scaleFactor = requestedServings / recipe.baseServings;

    const ingredientIds = recipe.ingredients.map((i) => i.ingredientId);
    const ingredientsData = await Ingredient.find({
      _id: { $in: ingredientIds },
    });

    const ingredientMap = new Map(
      ingredientsData.map((i) => [i._id.toString(), i]),
    );

    const scaledIngredients = recipe.ingredients.map((ri) => {
      const ingredientDoc = ingredientMap.get(ri.ingredientId.toString());
      const scalingRule = ri.scalingRule || inferScalingRule(ingredientDoc);
      const finalQuantity = applyScalingRule(ri.quantity, scaleFactor, scalingRule);

      return {
        ingredientId: ri.ingredientId,
        name: ri.name,
        requiredQuantity: Math.ceil(finalQuantity),
        unit: ri.unit,
        required: ri.required !== false,
        critical: ri.critical !== false,
        scalingRule,
      };
    });

    return scaledIngredients;
  }
}
