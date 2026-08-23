// Tests the real applyScalingRule function used by the deterministic serving
// engine (FR-04) against the dataset's three scaling rules directly.
import { applyScalingRule } from "../src/services/servingEngine.js";

describe("applyScalingRule (FR-04, dataset-driven)", () => {
  test("'linear' scales proportionally in both directions", () => {
    expect(applyScalingRule(400, 2, "linear")).toBe(800); // 4 -> 8 servings
    expect(applyScalingRule(400, 0.5, "linear")).toBe(200); // 4 -> 2 servings
  });

  test("'moderate' dampens increases but scales down linearly", () => {
    // 4 -> 8 servings, scaleFactor = 2: dampened = 1 + (2-1)*0.75 = 1.75
    expect(applyScalingRule(10, 2, "moderate")).toBe(17.5);
    // scaling down is untouched (dampening only applies on increase)
    expect(applyScalingRule(10, 0.5, "moderate")).toBe(5);
  });

  test("'fixed' never changes regardless of scale factor", () => {
    expect(applyScalingRule(5, 2, "fixed")).toBe(5);
    expect(applyScalingRule(5, 0.25, "fixed")).toBe(5);
  });

  test("defaults to linear for an unrecognized rule", () => {
    expect(applyScalingRule(100, 1.5, undefined)).toBe(150);
  });
});
