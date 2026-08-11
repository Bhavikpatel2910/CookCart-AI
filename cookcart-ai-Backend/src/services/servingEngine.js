import Ingredient from "../models/Ingredient.js";

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
      let finalQuantity = ri.quantity * scaleFactor;

      if (
        ingredientDoc &&
        (ingredientDoc.category === "Spices" ||
          ingredientDoc.category === "Oil" ||
          ingredientDoc.category === "Salt")
      ) {
        if (scaleFactor > 1) {
          const spiceScaleFactor = 1 + (scaleFactor - 1) * 0.75;
          finalQuantity = ri.quantity * spiceScaleFactor;
        }
      }

      return {
        ingredientId: ri.ingredientId,
        name: ri.name,
        requiredQuantity: Math.ceil(finalQuantity),
        unit: ri.unit,
        required: ri.required,
      };
    });

    return scaledIngredients;
  }
}
