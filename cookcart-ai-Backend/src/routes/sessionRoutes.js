import express from "express";
const { Router } = express;
import mongoose from "mongoose";
import RecipeSession from "../models/RecipeSession.js";

const router = Router();

router.patch("/:id/ingredients", async (req, res) => {
  try {
    const { action, ingredientId } = req.body;
    const session = await RecipeSession.findById(req.params.id);

    if (!session) return res.status(404).json({ error: "Session not found" });
    if (!ingredientId)
      return res.status(400).json({ error: "ingredientId is required" });

    const objIngredientId = new mongoose.Types.ObjectId(ingredientId);

    if (action === "remove") {
      if (!session.removedIngredients.includes(objIngredientId)) {
        session.removedIngredients.push(objIngredientId);
      }
    } else if (action === "add") {
      session.removedIngredients = session.removedIngredients.filter(
        (id) => id.toString() !== objIngredientId.toString(),
      );
    } else {
      return res
        .status(400)
        .json({ error: "Invalid action, use remove or add" });
    }

    await session.save();

    res.json({
      message: "Session updated successfully",
      removedIngredients: session.removedIngredients,
    });
  } catch (error) {
    console.error("Session patch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
