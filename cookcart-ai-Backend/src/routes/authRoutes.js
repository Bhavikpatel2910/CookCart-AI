import express from "express";
const { Router } = express;
import User from "../models/User.js";
import { validateBody } from "../middleware/validate.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/signup
router.post(
  "/signup",
  validateBody({
    name: { required: true, type: "string" },
    password: { required: true, type: "string" },
  }),
  async (req, res, next) => {
    try {
      const { name, email, phone, password } = req.body;

      const cleanEmail = email?.trim().toLowerCase() || undefined;
      const cleanPhone = phone?.trim() || undefined;

      if (!cleanEmail && !cleanPhone) {
        return res.status(400).json({ error: "Email or phone is required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existing = await User.findOne({
        $or: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      });
      if (existing) {
        return res.status(409).json({ error: "An account with this email or phone already exists" });
      }

      const user = await User.create({ name, email: cleanEmail, phone: cleanPhone, password });
      const token = signToken(user._id);

      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/auth/login
router.post(
  "/login",
  validateBody({
    password: { required: true, type: "string" },
  }),
  async (req, res, next) => {
    try {
      const { email, phone, password } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ error: "Email or phone is required" });
      }

      const query = email ? { email: email.toLowerCase().trim() } : { phone };
      const user = await User.findOne(query).select("+password");

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = signToken(user._id);
      res.json({ token, user: user.toSafeObject() });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
});

export default router;