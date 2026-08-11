import express from "express";
const { Router } = express;
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import RecipeSession from "../models/RecipeSession.js";
import { ServingEngine } from "../services/servingEngine.js";
import { PackOptimizer } from "../services/packOptimizer.js";

const router = Router();

router.get("/:recipeId", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:recipeId/generate", async (req, res) => {
  try {
    const { servings } = req.body;
    const userId = req.headers["x-user-id"] || "dummy-user-id";

    if (!servings || servings <= 0) {
      return res
        .status(400)
        .json({ error: "Valid servings count is required" });
    }

    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    const scaledIngredients = await ServingEngine.scaleIngredients(
      recipe,
      servings,
    );

    const session = await RecipeSession.create({
      userId,
      recipeId: recipe._id,
      servings,
      ingredients: scaledIngredients,
      removedIngredients: [],
      selectedSKUs: [],
      substitutions: [],
      estimatedTotal: 0,
    });

    res.json({ session });
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:recipeId/match-products", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const session = await RecipeSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const activeIngredients = session.ingredients.filter(
      (i) => !session.removedIngredients.includes(i.ingredientId),
    );

    const matchResults =
      await PackOptimizer.matchProductsForIngredients(activeIngredients);

    let estimatedTotal = 0;
    const selectedSKUs = [];

    for (const result of matchResults) {
      for (const matched of result.matchedProducts) {
        estimatedTotal += matched.price * matched.quantity;
        selectedSKUs.push({
          productId: matched.productId,
          quantity: matched.quantity,
        });
      }
    }

    session.selectedSKUs = selectedSKUs;
    session.estimatedTotal = estimatedTotal;
    await session.save();

    res.json({
      sessionId: session._id,
      matchResults,
      estimatedTotal,
    });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
