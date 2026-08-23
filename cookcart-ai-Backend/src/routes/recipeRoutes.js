import express from "express";
const { Router } = express;
import Recipe from "../models/Recipe.js";
import RecipeSession from "../models/RecipeSession.js";
import Product from "../models/Product.js";
import Pantry from "../models/Pantry.js";
import { ServingEngine } from "../services/servingEngine.js";
import { PackOptimizer } from "../services/packOptimizer.js";
import { validateBody, validateObjectIdParam } from "../middleware/validate.js";

const router = Router();

// List all recipes (used by frontend recipe listing/search + FR-02)
router.get("/", async (req, res, next) => {
  try {
    const { dietType, cuisine, difficulty } = req.query;
    const filter = {};
    if (dietType) filter.dietType = dietType;
    if (cuisine) filter.cuisine = cuisine;
    if (difficulty) filter.difficulty = difficulty;

    const recipes = await Recipe.find(filter).sort({ name: 1 });
    res.json({ recipes });
  } catch (error) {
    next(error);
  }
});

router.get("/:recipeId", validateObjectIdParam("recipeId"), async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:recipeId/generate",
  validateObjectIdParam("recipeId"),
  validateBody({ servings: { required: true, type: "number", min: 1 } }),
  async (req, res, next) => {
    try {
      const { servings } = req.body;
      const userId = req.headers["x-user-id"] || "dummy-user-id";

      const recipe = await Recipe.findById(req.params.recipeId);
      if (!recipe) return res.status(404).json({ error: "Recipe not found" });

      let scaledIngredients = await ServingEngine.scaleIngredients(recipe, servings);

      // Phase 2 / Pantry: auto-exclude ingredients the user has already
      // marked as owned staples, so they don't have to remove them by hand
      // every time. We do this by pre-populating removedIngredients rather
      // than dropping them from `ingredients`, so the UI can still show them
      // (greyed out) and let the user re-add if their pantry data is stale.
      const pantry = await Pantry.findOne({ userId });
      const pantryIngredientIds = new Set(
        (pantry?.ingredients || []).map((i) => i.ingredientId.toString()),
      );

      const removedIngredients = scaledIngredients
        .filter((i) => pantryIngredientIds.has(i.ingredientId.toString()))
        .map((i) => i.ingredientId);

      const session = await RecipeSession.create({
        userId,
        recipeId: recipe._id,
        servings,
        ingredients: scaledIngredients,
        removedIngredients,
        selectedSKUs: [],
        substitutions: [],
        estimatedTotal: 0,
        feasible: true,
      });

      res.json({
        session,
        pantryExcludedCount: removedIngredients.length,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:recipeId/match-products",
  validateObjectIdParam("recipeId"),
  validateBody({ sessionId: { required: true, type: "objectId" } }),
  async (req, res, next) => {
    try {
      const { sessionId } = req.body;

      const session = await RecipeSession.findById(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });

      // Bug fix: ObjectIds need string comparison, not reference equality
      const removedIds = new Set(session.removedIngredients.map((id) => id.toString()));
      const activeIngredients = session.ingredients.filter(
        (i) => !removedIds.has(i.ingredientId.toString()),
      );

      const matchResults = await PackOptimizer.matchProductsForIngredients(activeIngredients);

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

      // FR-10: Recipe Feasibility — "Currently unavailable to cook" if any
      // CRITICAL ingredient (absence materially prevents the dish, e.g.
      // paneer for Paneer Butter Masala) has no fulfillable product.
      // Falls back to `required` for older recipes seeded without `critical`.
      const unavailableCriticalIngredients = matchResults.filter(
        (r) => r.critical && r.matchedProducts.length === 0,
      );
      const feasible = unavailableCriticalIngredients.length === 0;

      // FR-09: collect disclosure messages for anything substituted/unavailable
      const substitutionNotices = matchResults
        .filter((r) => r.substitutionOccurred)
        .map((r) => ({ ingredientId: r.ingredientId, message: r.substitutionMessage }));

      session.selectedSKUs = selectedSKUs;
      session.estimatedTotal = estimatedTotal;
      session.feasible = feasible;
      await session.save();

      res.json({
        sessionId: session._id,
        matchResults,
        estimatedTotal,
        feasible,
        feasibilityMessage: feasible ? "Ready to cook" : "Currently unavailable to cook",
        unavailableIngredients: unavailableCriticalIngredients.map((r) => ({
          ingredientId: r.ingredientId,
          name: r.ingredientName,
        })),
        substitutionNotices,
      });
    } catch (error) {
      next(error);
    }
  },
);

// FR-07 / US-07: "Change Product" — list alternatives for one ingredient in a session
router.get(
  "/:recipeId/ingredients/:ingredientId/alternatives",
  validateObjectIdParam("recipeId"),
  validateObjectIdParam("ingredientId"),
  async (req, res, next) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) return res.status(400).json({ error: "sessionId query param is required" });

      const session = await RecipeSession.findById(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });

      const sessionIngredient = session.ingredients.find(
        (i) => i.ingredientId.toString() === req.params.ingredientId,
      );
      if (!sessionIngredient) {
        return res.status(404).json({ error: "Ingredient not found in this session" });
      }

      const alternatives = await PackOptimizer.getAlternativesForIngredient(
        req.params.ingredientId,
        sessionIngredient.requiredQuantity,
      );

      res.json({ ingredientId: req.params.ingredientId, alternatives });
    } catch (error) {
      next(error);
    }
  },
);

// FR-07 / US-07: apply a chosen alternative product to the session
router.post(
  "/:recipeId/change-product",
  validateObjectIdParam("recipeId"),
  validateBody({
    sessionId: { required: true, type: "objectId" },
    ingredientId: { required: true, type: "objectId" },
    newProductId: { required: true, type: "objectId" },
  }),
  async (req, res, next) => {
    try {
      const { sessionId, ingredientId, newProductId } = req.body;

      const session = await RecipeSession.findById(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });

      const sessionIngredient = session.ingredients.find(
        (i) => i.ingredientId.toString() === ingredientId,
      );
      if (!sessionIngredient) {
        return res.status(404).json({ error: "Ingredient not found in this session" });
      }

      const newProduct = await Product.findById(newProductId);
      if (!newProduct) return res.status(404).json({ error: "Product not found" });

      const packsNeeded = Math.ceil(sessionIngredient.requiredQuantity / newProduct.packSize);
      if (packsNeeded > newProduct.inventory) {
        return res.status(409).json({ error: "Selected product does not have enough inventory" });
      }

      // Drop any previously selected SKU that belonged to this ingredient
      const productsForIngredient = await Product.find({ ingredientId }, "_id");
      const oldProductIds = new Set(productsForIngredient.map((p) => p._id.toString()));

      session.selectedSKUs = session.selectedSKUs.filter(
        (sku) => !oldProductIds.has(sku.productId.toString()),
      );
      session.selectedSKUs.push({ productId: newProduct._id, quantity: packsNeeded });

      // Recompute total from the current selection to stay consistent
      let recomputedTotal = 0;
      for (const sku of session.selectedSKUs) {
        const p = await Product.findById(sku.productId);
        if (p) recomputedTotal += p.price * sku.quantity;
      }
      session.estimatedTotal = recomputedTotal;

      await session.save();

      res.json({
        message: "Product changed successfully",
        ingredientId,
        selectedProduct: {
          productId: newProduct._id,
          name: newProduct.name,
          brand: newProduct.brand,
          price: newProduct.price,
          quantity: packsNeeded,
        },
        estimatedTotal: session.estimatedTotal,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
