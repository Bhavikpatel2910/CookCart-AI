// Centralized error handler — keep route handlers throwing/rejecting,
// this converts them into a consistent JSON error shape.
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed", details: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
};
