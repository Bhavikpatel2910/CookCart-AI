import { scaleIngredientQuantity, calculatePackOptimization } from '../utils/quantityUtils.js';
import { getIngredientById } from '../api/ingredientApi.js';
import { getProductsByIngredient } from '../api/productApi.js';
import { getInventoryBySku } from '../api/inventoryApi.js';
import { formatPrice } from '../utils/priceUtils.js';

const SERVING_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

export function getServingOptions() {
  return SERVING_OPTIONS;
}

export async function calculateRecipeIngredients(recipe, servings) {
  const baseServings = recipe.base_servings || 1;
  const ratio = servings / baseServings;

  const scaledIngredients = await Promise.all(
    (recipe.ingredients || []).map(async (ingRef) => {
      const ingredient = await getIngredientById(ingRef.ingredient_id);
      const products = await getProductsByIngredient(ingRef.ingredient_id);
      
      let bestProduct = null;
      let bestInventory = null;
      
      for (const product of products) {
        const inventory = await getInventoryBySku(product.sku_id);
        if (inventory && inventory.in_stock) {
          bestProduct = product;
          bestInventory = inventory;
          break;
        }
      }
      
      if (!bestProduct && products.length > 0) {
        bestProduct = products[0];
        bestInventory = await getInventoryBySku(bestProduct.sku_id);
      }

      const baseQuantity = ingRef.quantity || 0;
      const unit = ingRef.unit || ingredient?.default_unit || '';
      const scaledQuantity = scaleIngredientQuantity(baseQuantity, ratio, ingRef.scaling_rule || 'linear');
      
      const packOptimization = bestProduct ? calculatePackOptimization(
        scaledQuantity,
        unit,
        bestProduct.pack_size,
        bestProduct.unit,
        bestProduct.price
      ) : null;

      return {
        ingredientId: ingRef.ingredient_id,
        ingredientName: ingredient?.canonical_name || ingRef.ingredient_id,
        ingredientCategory: ingredient?.category,
        ingredientImage: ingredient?.imageUrl || ingredient?.image || null,
        isPantryStaple: ingRef.pantry_staple || false,
        requiredQuantity: scaledQuantity,
        requiredUnit: unit,
        baseQuantity,
        baseUnit: unit,
        product: bestProduct ? {
          skuId: bestProduct.sku_id,
          name: bestProduct.product_name,
          brand: bestProduct.brand,
          packSize: bestProduct.pack_size,
          unit: bestProduct.unit,
          price: formatPrice(bestProduct.price),
          mrp: formatPrice(bestProduct.mrp),
          image: bestProduct.image,
        } : null,
        inventory: bestInventory ? {
          inStock: bestInventory.in_stock,
          lowStock: bestInventory.low_stock,
          availableQuantity: bestInventory.available_quantity,
          status: bestInventory.status,
        } : null,
        packOptimization,
        scalingRatio: ratio,
      };
    })
  );

  return scaledIngredients;
}

export async function calculateRecipeCost(scaledIngredients) {
  let total = 0;
  for (const ing of scaledIngredients) {
    if (ing.isPantryStaple) continue;
    if (ing.product && ing.packOptimization) {
      total += ing.packOptimization.totalPrice;
    }
  }
  return total;
}

export function getServingLabel(servings) {
  return `${servings} ${servings === 1 ? 'Person' : 'People'}`;
}