import Product from "../models/Product.js";

export class PackOptimizer {
  // Ranks all fulfillable (in-stock, sufficient inventory) products for one
  // ingredient by total cost, tie-broken by lowest pack waste. Best-first.
  // Implements: Best SKU = minimum(cost + waste_penalty) s.t. purchased >= required
  static rankCandidates(products, requiredQuantity) {
    const candidates = [];

    for (const product of products) {
      const packsNeeded = Math.ceil(requiredQuantity / product.packSize);
      if (packsNeeded > product.inventory) continue; // not enough stock to fulfil

      candidates.push({
        product,
        packsNeeded,
        totalCost: packsNeeded * product.price,
        waste: packsNeeded * product.packSize - requiredQuantity,
      });
    }

    candidates.sort((a, b) => {
      if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
      return a.waste - b.waste;
    });

    return candidates;
  }

  static toMatchedProduct(candidate) {
    const { product, packsNeeded } = candidate;
    return {
      productId: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      quantity: packsNeeded,
      totalPackSize: packsNeeded * product.packSize,
      unit: product.unit,
      image: product.image,
    };
  }

  static async matchProductsForIngredients(ingredients) {
    const results = [];

    for (const reqIng of ingredients) {
      // Pull ALL products (including out-of-stock) so we can distinguish
      // "no product exists" from "product exists but unavailable" — FR-09.
      const allProducts = await Product.find({ ingredientId: reqIng.ingredientId });
      const inStockProducts = allProducts.filter((p) => p.inventory > 0);

      const ranked = this.rankCandidates(inStockProducts, reqIng.requiredQuantity);

      const matchedProducts = [];
      let substitutionOccurred = false;
      let substitutionMessage = null;

      if (ranked.length > 0) {
        matchedProducts.push(this.toMatchedProduct(ranked[0]));
      } else if (allProducts.length > 0) {
        // FR-09: recommended product unavailable — disclose clearly
        substitutionOccurred = true;
        substitutionMessage = `${reqIng.name} is currently out of stock; no substitute available yet`;
      } else {
        substitutionOccurred = true;
        substitutionMessage = `No product mapped for ${reqIng.name}`;
      }

      // FR-07: every other ranked candidate becomes a "Change Product" alternative
      const alternatives = ranked.slice(1).map((c) => this.toMatchedProduct(c));

      results.push({
        ingredientId: reqIng.ingredientId,
        ingredientName: reqIng.name,
        requiredQuantity: reqIng.requiredQuantity,
        unit: reqIng.unit,
        required: reqIng.required !== false,
        matchedProducts,
        alternatives,
        substitutionOccurred,
        substitutionMessage,
        isPantryItem: false,
      });
    }

    return results;
  }

  // FR-07 / US-07: fetch alternatives for a "Change Product" action on one ingredient
  static async getAlternativesForIngredient(ingredientId, requiredQuantity, excludeProductId) {
    const filter = { ingredientId, inventory: { $gt: 0 } };
    if (excludeProductId) filter._id = { $ne: excludeProductId };

    const products = await Product.find(filter);
    const ranked = this.rankCandidates(products, requiredQuantity);
    return ranked.map((c) => this.toMatchedProduct(c));
  }
}
