import express from "express";
const { Router } = express;
import Product from "../models/Product.js";
import { validateObjectIdParam } from "../middleware/validate.js";

const router = Router();

// List all products (frontend uses this to build its local product index)
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/ingredient/:ingredientId",
  validateObjectIdParam("ingredientId"),
  async (req, res, next) => {
    try {
      const products = await Product.find({ ingredientId: req.params.ingredientId });
      res.json({ products });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/:productId", validateObjectIdParam("productId"), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;
