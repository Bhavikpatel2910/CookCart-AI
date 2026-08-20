import { PackOptimizer } from "../src/services/packOptimizer.js";

// Minimal fake product objects — rankCandidates only touches these fields,
// so we don't need a real Mongoose document for pure-logic testing.
const makeProduct = (overrides) => ({
  _id: overrides.id,
  name: overrides.name,
  brand: overrides.brand || "Brand",
  packSize: overrides.packSize,
  price: overrides.price,
  inventory: overrides.inventory,
  unit: overrides.unit || "g",
  image: null,
});

describe("PackOptimizer.rankCandidates", () => {
  test("picks the lowest total cost option that satisfies required quantity", () => {
    const products = [
      makeProduct({ id: "p1", packSize: 100, price: 40, inventory: 10 }), // needs 4 packs -> 160
      makeProduct({ id: "p2", packSize: 500, price: 150, inventory: 5 }), // needs 1 pack -> 150
    ];

    const ranked = PackOptimizer.rankCandidates(products, 400);
    expect(ranked[0].product._id).toBe("p2");
    expect(ranked[0].totalCost).toBe(150);
  });

  test("ties on cost are broken by lowest waste", () => {
    const products = [
      makeProduct({ id: "p1", packSize: 200, price: 50, inventory: 10 }), // 2 packs -> 100, waste 0 for 400
      makeProduct({ id: "p2", packSize: 250, price: 50, inventory: 10 }), // 2 packs -> 100, waste 100 for 400
    ];

    const ranked = PackOptimizer.rankCandidates(products, 400);
    expect(ranked[0].product._id).toBe("p1");
    expect(ranked[0].waste).toBe(0);
  });

  test("excludes products that don't have enough inventory to cover packs needed", () => {
    const products = [
      makeProduct({ id: "p1", packSize: 100, price: 40, inventory: 2 }), // needs 4 packs, only 2 in stock
    ];

    const ranked = PackOptimizer.rankCandidates(products, 400);
    expect(ranked.length).toBe(0);
  });

  test("returns candidates sorted best-first for alternatives (FR-07)", () => {
    const products = [
      makeProduct({ id: "p1", packSize: 100, price: 60, inventory: 10 }),
      makeProduct({ id: "p2", packSize: 100, price: 40, inventory: 10 }),
      makeProduct({ id: "p3", packSize: 100, price: 50, inventory: 10 }),
    ];

    const ranked = PackOptimizer.rankCandidates(products, 100);
    expect(ranked.map((c) => c.product._id)).toEqual(["p2", "p3", "p1"]);
  });
});
