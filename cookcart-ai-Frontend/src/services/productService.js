import { getProductsByIngredient, getProductBySku } from '../api/productApi.js';
import { getInventoryBySku } from '../api/inventoryApi.js';
import { getSubstitutionsForIngredient } from '../api/recipeApi.js';
import { calculatePackOptimization, getRecommendedPackOption } from '../utils/quantityUtils.js';
import { formatPrice } from '../utils/priceUtils.js';
import { getProductImageUrl } from '../utils/imageUtils.js';

export async function getAvailableProductsForIngredient(ingredientId, requiredQuantity, requiredUnit) {
  const products = await getProductsByIngredient(ingredientId);
  
  const productsWithInventory = await Promise.all(
    products.map(async (product) => {
      const inventory = await getInventoryBySku(product.sku_id);
      const packOptimization = calculatePackOptimization(
        requiredQuantity,
        requiredUnit,
        product.pack_size,
        product.unit,
        product.price
      );
      
      return {
        skuId: product.sku_id,
        name: product.product_name,
        brand: product.brand,
        packSize: product.pack_size,
        unit: product.unit,
        price: formatPrice(product.price),
        mrp: formatPrice(product.mrp),
        image: getProductImageUrl(product),
        vegetarian: product.vegetarian,
        vegan: product.vegan,
        allergens: product.allergens,
        inventory: inventory ? {
          inStock: inventory.in_stock,
          lowStock: inventory.low_stock,
          availableQuantity: inventory.available_quantity,
          status: inventory.status,
        } : null,
        packOptimization,
      };
    })
  );

  const inStock = productsWithInventory.filter(p => p.inventory?.inStock);
  const outOfStock = productsWithInventory.filter(p => !p.inventory?.inStock);
  
  const recommended = getRecommendedPackOption(inStock, requiredQuantity);
  
  return {
    all: productsWithInventory,
    inStock,
    outOfStock,
    recommended,
    hasAlternatives: outOfStock.length > 0,
  };
}

export async function getProductDetails(skuId) {
  const product = await getProductBySku(skuId);
  if (!product) return null;

  const inventory = await getInventoryBySku(skuId);
  const substitutions = await getSubstitutionsForIngredient(product.ingredient_id);

  return {
    skuId: product.sku_id,
    name: product.product_name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    packSize: product.pack_size,
    unit: product.unit,
    price: formatPrice(product.price),
    mrp: formatPrice(product.mrp),
    discountPercent: product.discount_percent,
    image: getProductImageUrl(product),
    vegetarian: product.vegetarian,
    vegan: product.vegan,
    allergens: product.allergens,
    tags: product.tags,
    searchKeywords: product.search_keywords,
    ingredientId: product.ingredient_id,
    inventory: inventory ? {
      inStock: inventory.in_stock,
      lowStock: inventory.low_stock,
      availableQuantity: inventory.available_quantity,
      reservedQuantity: inventory.reserved_quantity,
      status: inventory.status,
      warehouseId: inventory.warehouse_id,
      updatedAt: inventory.updated_at,
    } : null,
    substitutions: substitutions?.map(s => ({
      skuId: s.substitute_sku_id,
      reason: s.reason,
      dietaryCompatible: s.dietary_compatible,
      allergenCompatible: s.allergen_compatible,
    })) || [],
  };
}

export async function getAlternativeProducts(skuId, ingredientId) {
  const allProducts = await getProductsByIngredient(ingredientId);
  const alternatives = allProducts.filter(p => p.sku_id !== skuId);
  
  const alternativesWithInventory = await Promise.all(
    alternatives.map(async (product) => {
      const inventory = await getInventoryBySku(product.sku_id);
      return {
        skuId: product.sku_id,
        name: product.product_name,
        brand: product.brand,
        packSize: product.pack_size,
        unit: product.unit,
        price: formatPrice(product.price),
        mrp: formatPrice(product.mrp),
        image: getProductImageUrl(product),
        inStock: inventory?.in_stock || false,
        lowStock: inventory?.low_stock || false,
      };
    })
  );

  return alternativesWithInventory
    .filter(p => p.inStock)
    .sort((a, b) => Number(a.price.replace('₹', '')) - Number(b.price.replace('₹', '')));
}

export function formatPackSize(packSize, unit) {
  return `${packSize}${unit}`;
}

export function getPricePerUnit(price, packSize) {
  if (!packSize) return 0;
  return price / packSize;
}
