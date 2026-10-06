import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const newOrderId = () =>
  `ORD${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
const money = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Place an order. Totals are recomputed on the server from the line items so
// the stored amount can't drift from what was actually ordered.
router.post(
  "/",
  validateBody({
    userId: { required: true, type: "string" },
    items: { required: true, type: "array" },
  }),
  async (req, res, next) => {
    try {
      const { userId, items, recipe = {}, delivery = {}, payment = {}, address = {}, pantrySavings = 0, packagingFee = 0 } = req.body;

      const lines = items
        .filter((it) => it && it.skuId && Number(it.quantity) > 0)
        .map((it) => {
          const quantity = Math.floor(Number(it.quantity));
          const unitPrice = money(it.unitPrice);
          return {
            skuId: String(it.skuId),
            name: String(it.name || "Item"),
            brand: it.brand || undefined,
            image: it.image || undefined,
            packSize: it.packSize != null ? String(it.packSize) : undefined,
            quantity,
            unitPrice,
            lineTotal: money(unitPrice * quantity),
          };
        });

      if (lines.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
      }

      const subtotal = money(lines.reduce((sum, l) => sum + l.lineTotal, 0));
      const deliveryFee = money(delivery.fee);
      const pkgFee = money(packagingFee);
      const savings = Math.min(money(pantrySavings), subtotal);
      const total = money(subtotal - savings + deliveryFee + pkgFee);

      const order = await Order.create({
        orderId: newOrderId(),
        userId,
        recipeId: recipe.id,
        recipeName: recipe.name || "Grocery order",
        recipeSlug: recipe.slug,
        recipeImage: recipe.image,
        servings: recipe.servings,
        items: lines,
        pricing: { subtotal, pantrySavings: savings, deliveryFee, packagingFee: pkgFee, total },
        delivery: { method: delivery.method || "standard", etaMinutes: delivery.etaMinutes },
        payment: { method: payment.method || "cod" },
        address: { name: address.name, phone: address.phone, line1: address.line1, line2: address.line2 },
        status: "confirmed",
      });

      // The basket has been ordered, so clear the synced cart as well.
      await User.updateOne({ userId }, { $set: { cart: [] } });

      res.status(201).json({ order });
    } catch (error) {
      next(error);
    }
  },
);

// A user's order history, newest first.
router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const orders = await Order.find({ userId }).sort({ placedAt: -1 }).limit(100);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/:orderId", async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const order = await Order.findOne({ orderId: req.params.orderId, userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
