import express from "express";
const { Router } = express;
import mongoose from "mongoose";
import RecipeSession from "../models/RecipeSession.js";
import { validateBody, validateObjectIdParam } from "../middleware/validate.js";

const router = Router();

router.patch(
  "/:id/ingredients",
  validateObjectIdParam("id"),
  validateBody({
    action: { required: true, type: "enum", values: ["add", "remove"] },
    ingredientId: { required: true, type: "objectId" },
  }),
  async (req, res, next) => {
    try {
      const { action, ingredientId } = req.body;
      const session = await RecipeSession.findById(req.params.id);
      if (!session) return res.status(404).json({ error: "Session not found" });

      const objIngredientId = new mongoose.Types.ObjectId(ingredientId);

      if (action === "remove") {
        // Bug fix: .includes() on ObjectId arrays does reference equality,
        // not value equality — compare via .toString() instead.
        const alreadyRemoved = session.removedIngredients.some(
          (id) => id.toString() === objIngredientId.toString(),
        );
        if (!alreadyRemoved) {
          session.removedIngredients.push(objIngredientId);
        }
      } else {
        session.removedIngredients = session.removedIngredients.filter(
          (id) => id.toString() !== objIngredientId.toString(),
        );
      }

      await session.save();

      res.json({
        message: "Session updated successfully",
        removedIngredients: session.removedIngredients,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/:id", validateObjectIdParam("id"), async (req, res, next) => {
  try {
    const session = await RecipeSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

export default router;
