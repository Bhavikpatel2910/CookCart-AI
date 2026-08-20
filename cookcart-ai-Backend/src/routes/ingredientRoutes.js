import express from "express";
const { Router } = express;
import Ingredient from "../models/Ingredient.js";
import { IngredientNormalizer } from "../services/ingredientNormalizer.js";
import { validateBody, validateObjectIdParam } from "../middleware/validate.js";

const router = Router();

// FR-05: resolve a free-text ingredient name to its canonical ingredient
router.get("/resolve", async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "name query param is required" });

    const ingredient = await IngredientNormalizer.resolve(name);
    if (!ingredient) {
      return res.status(404).json({ error: "No canonical ingredient found", input: name });
    }

    res.json({ input: name, ingredient });
  } catch (error) {
    next(error);
  }
});

// FR-05: resolve many names at once (used by recipe ingestion/curation tooling)
router.post(
  "/resolve-batch",
  validateBody({ names: { required: true, type: "array" } }),
  async (req, res, next) => {
    try {
      const { names } = req.body;
      const result = await IngredientNormalizer.resolveBatch(names);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

// Admin/curation: register a new alias on an existing canonical ingredient
router.post(
  "/:ingredientId/aliases",
  validateObjectIdParam("ingredientId"),
  validateBody({ alias: { required: true, type: "string" } }),
  async (req, res, next) => {
    try {
      const ingredient = await IngredientNormalizer.addAlias(
        req.params.ingredientId,
        req.body.alias,
      );
      res.json({ ingredient });
    } catch (error) {
      if (error.message === "Ingredient not found") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },
);

router.get("/", async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().sort({ canonicalName: 1 });
    res.json({ ingredients });
  } catch (error) {
    next(error);
  }
});

export default router;
