import express from "express";
const { Router } = express;
import Recipe from "../models/Recipe.js";
import { AIService } from "../services/aiService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const matchedSlug = await AIService.understandDishIntent(query);

    if (matchedSlug) {
      const recipe = await Recipe.findOne({ slug: matchedSlug });
      if (recipe) {
        return res.json({
          recipes: [recipe],
          cookAtHomeAvailable: true,
        });
      }
    }

    const regex = new RegExp(query.split(" ").join("|"), "i");
    const recipes = await Recipe.find({
      $or: [{ name: regex }, { tags: regex }],
    });

    res.json({
      recipes,
      cookAtHomeAvailable: recipes.length > 0,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
