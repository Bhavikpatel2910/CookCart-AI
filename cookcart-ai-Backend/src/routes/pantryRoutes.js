import express from "express";
const { Router } = express;
import Pantry from "../models/Pantry.js";
import Ingredient from "../models/Ingredient.js";
import { validateBody, validateObjectIdParam } from "../middleware/validate.js";

const router = Router();

// Get the current user's pantry (creates an empty one on first access)
router.get("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || "dummy-user-id";
    let pantry = await Pantry.findOne({ userId });
    if (!pantry) {
      pantry = await Pantry.create({ userId, ingredients: [] });
    }
    res.json({ pantry });
  } catch (error) {
    next(error);
  }
});

// Add or update a staple ingredient in the pantry
router.post(
  "/ingredients",
  validateBody({
    ingredientId: { required: true, type: "objectId" },
    quantity: { required: true, type: "number", min: 0 },
    unit: { required: true, type: "string" },
  }),
  async (req, res, next) => {
    try {
      const userId = req.headers["x-user-id"] || "dummy-user-id";
      const { ingredientId, quantity, unit } = req.body;

      const ingredientExists = await Ingredient.findById(ingredientId);
      if (!ingredientExists) {
        return res.status(404).json({ error: "Ingredient not found" });
      }

      let pantry = await Pantry.findOne({ userId });
      if (!pantry) {
        pantry = await Pantry.create({ userId, ingredients: [] });
      }

      const existing = pantry.ingredients.find(
        (i) => i.ingredientId.toString() === ingredientId,
      );
      if (existing) {
        existing.quantity = quantity;
        existing.unit = unit;
        existing.updatedAt = new Date();
      } else {
        pantry.ingredients.push({ ingredientId, quantity, unit, updatedAt: new Date() });
      }

      await pantry.save();
      res.json({ pantry });
    } catch (error) {
      next(error);
    }
  },
);

// Remove a staple from the pantry
router.delete(
  "/ingredients/:ingredientId",
  validateObjectIdParam("ingredientId"),
  async (req, res, next) => {
    try {
      const userId = req.headers["x-user-id"] || "dummy-user-id";
      const pantry = await Pantry.findOne({ userId });
      if (!pantry) return res.status(404).json({ error: "Pantry not found" });

      pantry.ingredients = pantry.ingredients.filter(
        (i) => i.ingredientId.toString() !== req.params.ingredientId,
      );

      await pantry.save();
      res.json({ pantry });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
