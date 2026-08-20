import express from "express";
const { Router } = express;
import Product from "../models/Product.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

router.post(
  "/add-recipe",
  validateBody({
    recipe_id: { required: true, type: "objectId" },
    products: { required: true, type: "array" },
  }),
  async (req, res, next) => {
    try {
      const { recipe_id, servings, products } = req.body;

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
      next(error);
    }
  },
);

export default router;
