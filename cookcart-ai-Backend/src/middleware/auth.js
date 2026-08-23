import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cookcart_dev_secret_change_me";

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default requireAuth;
