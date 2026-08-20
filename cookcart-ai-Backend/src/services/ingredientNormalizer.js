import Ingredient from "../models/Ingredient.js";

// FR-05 — Ingredient Normalization
// Resolves recipe/search language variants ("Paneer", "Indian Cottage Cheese",
// "Fresh paneer") to a single canonical Ingredient document, so catalog
// matching (FR-06) is reliable regardless of which name was typed/stored.

const normalize = (text) => text.trim().toLowerCase();

export class IngredientNormalizer {
  // Case/whitespace-insensitive exact match against canonicalName or aliases.
  static async resolve(rawName) {
    if (!rawName || typeof rawName !== "string") return null;
    const target = normalize(rawName);

    // Fast path: exact canonical name match (case-insensitive)
    let ingredient = await Ingredient.findOne({
      canonicalName: { $regex: `^${escapeRegex(target)}$`, $options: "i" },
    });
    if (ingredient) return ingredient;

    // Alias match (case-insensitive)
    ingredient = await Ingredient.findOne({
      aliases: { $elemMatch: { $regex: `^${escapeRegex(target)}$`, $options: "i" } },
    });
    if (ingredient) return ingredient;

    // Fuzzy fallback: partial/contains match, in case of small typos or
    // extra words (e.g. "fresh paneer cubes" -> "Fresh Paneer" alias)
    const fuzzy = await Ingredient.findOne({
      $or: [
        { canonicalName: { $regex: escapeRegex(target), $options: "i" } },
        { aliases: { $regex: escapeRegex(target), $options: "i" } },
      ],
    });
    return fuzzy || null;
  }

  // Resolve a batch of raw ingredient name strings in one go.
  // Returns { resolved: [{ input, ingredient }], unresolved: [input, ...] }
  static async resolveBatch(rawNames) {
    const resolved = [];
    const unresolved = [];

    for (const rawName of rawNames) {
      const ingredient = await this.resolve(rawName);
      if (ingredient) {
        resolved.push({ input: rawName, ingredient });
      } else {
        unresolved.push(rawName);
      }
    }

    return { resolved, unresolved };
  }

  // Registers a new alias on an existing canonical ingredient — used when an
  // unresolved name is manually mapped by an admin/curation step.
  static async addAlias(ingredientId, alias) {
    const cleanAlias = alias.trim();
    if (!cleanAlias) throw new Error("Alias cannot be empty");

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) throw new Error("Ingredient not found");

    const exists = ingredient.aliases.some(
      (a) => normalize(a) === normalize(cleanAlias),
    );
    if (!exists) {
      ingredient.aliases.push(cleanAlias);
      await ingredient.save();
    }
    return ingredient;
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
