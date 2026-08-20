import mongoose from "mongoose";

// Lightweight, dependency-free request validation middleware.
// Avoids pulling in Joi/Zod just for a handful of checks.

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateObjectIdParam = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!isValidObjectId(value)) {
    return res.status(400).json({ error: `Invalid ${paramName}: must be a valid ObjectId` });
  }
  next();
};

// body: { field: { required: true, type: 'string' | 'number' | 'objectId' | 'array' } }
export const validateBody = (schema) => (req, res, next) => {
  const errors = [];
  const body = req.body || {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    const present = value !== undefined && value !== null && value !== "";

    if (rules.required && !present) {
      errors.push(`${field} is required`);
      continue;
    }
    if (!present) continue;

    switch (rules.type) {
      case "string":
        if (typeof value !== "string") errors.push(`${field} must be a string`);
        break;
      case "number":
        if (typeof value !== "number" || Number.isNaN(value)) {
          errors.push(`${field} must be a number`);
        } else {
          if (rules.min !== undefined && value < rules.min) {
            errors.push(`${field} must be >= ${rules.min}`);
          }
          if (rules.max !== undefined && value > rules.max) {
            errors.push(`${field} must be <= ${rules.max}`);
          }
        }
        break;
      case "objectId":
        if (!isValidObjectId(value)) errors.push(`${field} must be a valid ObjectId`);
        break;
      case "array":
        if (!Array.isArray(value)) errors.push(`${field} must be an array`);
        break;
      case "enum":
        if (!rules.values.includes(value)) {
          errors.push(`${field} must be one of: ${rules.values.join(", ")}`);
        }
        break;
      default:
        break;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
};
