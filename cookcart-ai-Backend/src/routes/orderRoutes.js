import express from "express";
const { Router } = express;
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateObjectIdParam } from "../middleware/validate.js";

const router = Router();

// All order routes require authentication
router.use(requireAuth);

// POST /api/orders — place a new order, stored against the logged-in user
router.post(
  "/",
  validateBody({
    items: { required: true, type: "array" },
  }),
  async (req, res, next) => {
    try {
      const {
        items,
        address,
        recipe_id,
        deliveryMethod,
        paymentMethod,
        deliveryFee = 0,
        packagingFee = 0,
      } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
      }
      if (!address || !address.name || !address.phone || !address.line1) {
        return res.status(400).json({ error: "A valid delivery address is required" });
      }

      const normalizedItems = items.map((item) => ({
        sku_id: item.sku_id || item.skuId || undefined,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price ?? item.price ?? 0,
      }));

      const subtotal = normalizedItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      );
      const total = subtotal + Number(deliveryFee) + Number(packagingFee);

      const order = await Order.create({
        user: req.userId,
        recipe_id: recipe_id || undefined,
        items: normalizedItems,
        address,
        deliveryMethod,
        paymentMethod,
        subtotal,
        deliveryFee,
        packagingFee,
        total,
      });

      res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/orders — list orders for the logged-in user
router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id — fetch a single order (must belong to the user)
router.get("/:id", validateObjectIdParam("id"), async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
