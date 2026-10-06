import express from "express";
import User from "../models/User.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// Upsert the signed-in user's profile. Called on login/signup and returns the
// stored cart + favourites so the client can restore them.
router.post(
  "/sync",
  validateBody({ userId: { required: true, type: "string" } }),
  async (req, res, next) => {
    try {
      const { userId, name, email, phone, avatar, provider, updateName } = req.body;
      const fallbackName =
        (typeof name === "string" && name.trim()) ||
        (typeof email === "string" && email.includes("@") ? email.split("@")[0] : "") ||
        "Chef";

      const set = { lastLoginAt: new Date() };
      // A returning login must not overwrite the name chosen at signup.
      if (updateName && name) set.name = name.trim();
      if (email) set.email = email;
      if (phone) set.phone = phone;
      if (avatar) set.avatar = avatar;
      if (provider) set.provider = provider;

      const user = await User.findOneAndUpdate(
        { userId },
        { $set: set, $setOnInsert: { userId, ...(set.name ? {} : { name: fallbackName }) } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/:userId", async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:userId/cart",
  validateBody({ items: { required: true, type: "array" } }),
  async (req, res, next) => {
    try {
      const user = await User.findOneAndUpdate(
        { userId: req.params.userId },
        { $set: { cart: req.body.items.slice(0, 200) } },
        { new: true },
      );
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ cart: user.cart });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/:userId/favorites",
  validateBody({ favorites: { required: true, type: "array" } }),
  async (req, res, next) => {
    try {
      const favorites = req.body.favorites.filter((f) => typeof f === "string").slice(0, 500);
      const user = await User.findOneAndUpdate(
        { userId: req.params.userId },
        { $set: { favorites } },
        { new: true },
      );
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ favorites: user.favorites });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
