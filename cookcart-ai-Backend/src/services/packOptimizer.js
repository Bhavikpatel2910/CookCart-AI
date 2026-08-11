import Product from "../models/Product.js";

export class PackOptimizer {
  static async matchProductsForIngredients(ingredients) {
    const results = [];

    for (const reqIng of ingredients) {
      const products = await Product.find({
        ingredientId: reqIng.ingredientId,
        inventory: { $gt: 0 },
      });

      let bestSku = null;
      let bestPacks = 0;
      let lowestCost = Infinity;

      for (const product of products) {
        const packsNeeded = Math.ceil(
          reqIng.requiredQuantity / product.packSize,
        );

        if (packsNeeded > product.inventory) continue;

        const totalCost = packsNeeded * product.price;

        if (totalCost < lowestCost) {
          lowestCost = totalCost;
          bestSku = product;
          bestPacks = packsNeeded;
        } else if (totalCost === lowestCost) {
          const currentWaste =
            bestPacks * (bestSku?.packSize || 0) - reqIng.requiredQuantity;
          const newWaste =
            packsNeeded * product.packSize - reqIng.requiredQuantity;
          if (newWaste < currentWaste) {
            bestSku = product;
            bestPacks = packsNeeded;
          }
        }
      }

      const matchedProducts = [];
      if (bestSku && bestPacks > 0) {
        matchedProducts.push({
          productId: bestSku._id,
          name: bestSku.name,
          brand: bestSku.brand,
          price: bestSku.price,
          quantity: bestPacks,
          totalPackSize: bestPacks * bestSku.packSize,
          unit: bestSku.unit,
          image: bestSku.image,
        });
      }

      results.push({
        ingredientId: reqIng.ingredientId,
        ingredientName: reqIng.name,
        requiredQuantity: reqIng.requiredQuantity,
        unit: reqIng.unit,
        matchedProducts,
        isPantryItem: false,
      });
    }

    return results;
  }
}
