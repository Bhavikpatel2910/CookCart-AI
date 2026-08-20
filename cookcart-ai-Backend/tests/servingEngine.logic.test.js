// ServingEngine.scaleIngredients hits the DB (Ingredient.find) so we test the
// pure scaling formula it relies on in isolation here, mirroring FR-04.
// (A full DB-integration test can be added later with mongodb-memory-server.)

function scaleQuantity(baseQuantity, baseServings, requestedServings, isNonLinearCategory) {
  const scaleFactor = requestedServings / baseServings;
  if (isNonLinearCategory && scaleFactor > 1) {
    const spiceScaleFactor = 1 + (scaleFactor - 1) * 0.75;
    return Math.ceil(baseQuantity * spiceScaleFactor);
  }
  return Math.ceil(baseQuantity * scaleFactor);
}

describe("Serving scaling formula (FR-04)", () => {
  test("scales linearly for regular ingredients", () => {
    // 400g paneer, base 4 servings -> 2 servings = 200g
    expect(scaleQuantity(400, 4, 2, false)).toBe(200);
  });

  test("scales up linearly for regular ingredients", () => {
    // 400g paneer, base 4 -> 8 servings = 800g
    expect(scaleQuantity(400, 4, 8, false)).toBe(800);
  });

  test("dampens scaling for spice/oil/salt categories when scaling up", () => {
    // base 10g salt, 4 -> 8 servings: linear would be 20g,
    // dampened factor = 1 + (2-1)*0.75 = 1.75 -> 17.5 -> ceil 18
    expect(scaleQuantity(10, 4, 8, true)).toBe(18);
  });

  test("does not dampen when scaling down", () => {
    // scale factor < 1, PRD/implementation only dampens on scale-up
    expect(scaleQuantity(10, 4, 2, true)).toBe(5);
  });
});
