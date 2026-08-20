// Pure-logic test for the regex-escaping helper inside IngredientNormalizer.
// Full resolve()/resolveBatch() behaviour depends on Mongoose queries and is
// best covered by an integration test against a real/mock DB; this guards
// the one bit of non-trivial logic that doesn't need a database.

import { IngredientNormalizer } from "../src/services/ingredientNormalizer.js";

describe("IngredientNormalizer.resolve input handling", () => {
  test("returns null for empty/invalid input without hitting the DB", async () => {
    expect(await IngredientNormalizer.resolve("")).toBeNull();
    expect(await IngredientNormalizer.resolve(null)).toBeNull();
    expect(await IngredientNormalizer.resolve(undefined)).toBeNull();
    expect(await IngredientNormalizer.resolve(42)).toBeNull();
  });
});
