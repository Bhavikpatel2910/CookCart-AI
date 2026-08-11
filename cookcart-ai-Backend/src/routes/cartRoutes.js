import express from "express";
const { Router } = express;
import Product from "../models/Product.js";

const router = Router();

router.post("/add-recipe", async (req, res) => {
  try {
    const { recipe_id, servings, products } = req.body;

    if (!recipe_id || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const successfulProducts = [];
    const failedProducts = [];
    let totalPrice = 0;

    for (const item of products) {
      const product = await Product.findById(item.sku_id);
      if (product && product.inventory >= item.quantity) {
        successfulProducts.push({
          sku_id: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        });
        totalPrice += product.price * item.quantity;
      } else {
        failedProducts.push({
          sku_id: item.sku_id,
          reason: product ? "Out of stock" : "Product not found",
        });
      }
    }

    res.json({
      message: "Recipe added to cart",
      recipe_id,
      servings,
      addedProducts: successfulProducts,
      failedProducts,
      cartTotal: totalPrice,
    });
  } catch (error) {
    console.error("Cart add error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
