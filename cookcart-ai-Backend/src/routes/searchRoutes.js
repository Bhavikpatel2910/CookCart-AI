import express from "express";
const { Router } = express;
import Recipe from "../models/Recipe.js";
import { AIService } from "../services/aiService.js";
import { IngredientNormalizer } from "../services/ingredientNormalizer.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // FR-01: dish-intent recognition (e.g. "paneer buter masala" -> PBM)
    const matchedSlug = await AIService.understandDishIntent(query);

    if (matchedSlug) {
      const recipe = await Recipe.findOne({ slug: matchedSlug });
      if (recipe) {
        return res.json({
          recipes: [recipe],
          cookAtHomeAvailable: true,
          matchType: "dish_intent",
        });
      }
    }

    // FR-05: ingredient-intent recognition — e.g. searching "fresh paneer" or
    // "indian cottage cheese" should surface recipes using the canonical
    // ingredient (Paneer), not just literal name/tag text matches.
    const canonicalIngredient = await IngredientNormalizer.resolve(query);
    if (canonicalIngredient) {
      const recipesByIngredient = await Recipe.find({
        "ingredients.ingredientId": canonicalIngredient._id,
      });
      if (recipesByIngredient.length > 0) {
        return res.json({
          recipes: recipesByIngredient,
          cookAtHomeAvailable: true,
          matchType: "ingredient_intent",
          resolvedIngredient: canonicalIngredient.canonicalName,
        });
      }
    }

    // Fallback: plain text match against recipe name/tags
    const regex = new RegExp(query.split(" ").join("|"), "i");
    const recipes = await Recipe.find({
      $or: [{ name: regex }, { tags: regex }],
    });

    res.json({
      recipes,
      cookAtHomeAvailable: recipes.length > 0,
      matchType: "text",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
