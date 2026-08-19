import { clearCartStorage, saveCartToStorage } from '../api/cartApi.js';
import { getInventoryBySku } from '../api/inventoryApi.js';
import { calculateCartTotal } from '../utils/priceUtils.js';
import { getProductImageUrl } from '../utils/imageUtils.js';

// Coerce a price (could be a number, "₹92", or "92,00") into a finite number.
export function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// Canonical cart item. Everything is keyed by `skuId` (falling back to `id`)
// and prices are always numeric so totals can never be NaN. `name`/`productName`
// are both kept for backward compatibility with existing consumers.
export function normalizeCartItem(raw) {
  if (!raw) return null;
  const skuId = raw.skuId ?? raw.sku_id ?? raw.id ?? null;
  const price = toNumber(raw.price);
  const mrp = toNumber(raw.mrp ?? raw.mrp ?? price);
  const quantity = Math.max(1, Math.floor(toNumber(raw.quantity)) || 1);
  const packSizeRaw = raw.packSize ?? raw.pack_size ?? null;
  const unit = raw.unit ?? null;
  const packSize =
    typeof packSizeRaw === 'string'
      ? packSizeRaw
      : packSizeRaw != null
        ? `${packSizeRaw}${unit || ''}`
        : null;
  const image = getProductImageUrl(raw);
  return {
    skuId,
    id: skuId,
    productName: raw.productName ?? raw.name ?? raw.product_name ?? null,
    name: raw.productName ?? raw.name ?? raw.product_name ?? 'Item',
    brand: raw.brand ?? null,
    packSize,
    unit,
    price,
    mrp,
    image,
    quantity,
    isVeg: raw.isVeg ?? raw.vegetarian ?? true,
    allergens: raw.allergens ?? [],
    category: raw.category ?? null,
    bg: raw.bg ?? 'bg-surface-container-low',
    fromPantry: raw.fromPantry || false,
    recipeId: raw.recipeId ?? raw.recipe_id ?? null,
    ingredientId: raw.ingredientId ?? raw.ingredient_id ?? null,
    addedAt: raw.addedAt ?? new Date().toISOString(),
  };
}

// Build a cart item from a scaled recipe ingredient (has .product +
// .packOptimization). This is the single code path for "add ingredient to cart".
export function buildCartItemFromScaledIngredient(ing, options = {}) {
  if (!ing?.product) return null;
  const packCount = ing.packOptimization?.packCount ?? 1;
  return normalizeCartItem({
    skuId: ing.product.skuId,
    name: ing.product.name,
    brand: ing.product.brand,
    packSize: ing.product.packSize,
    unit: ing.product.unit,
    price: ing.product.price,
    mrp: ing.product.mrp,
    image: ing.product.image,
    category: ing.ingredientCategory,
    quantity: packCount,
    isVeg: ing.product.vegetarian ?? true,
    fromPantry: options.fromPantry || false,
    recipeId: options.recipeId ?? null,
    ingredientId: options.ingredientId ?? ing.ingredientId ?? null,
  });
}

export function createCartItem(sku, quantity = 1, options = {}) {
  return normalizeCartItem({
    skuId: sku.sku_id,
    name: sku.product_name,
    brand: sku.brand,
    packSize: sku.pack_size,
    unit: sku.unit,
    price: sku.price,
    mrp: sku.mrp,
    image: sku.image,
    quantity,
    isVeg: sku.vegetarian,
    allergens: sku.allergens,
    fromPantry: options.fromPantry || false,
    recipeId: options.recipeId || null,
    ingredientId: options.ingredientId || null,
  });
}

export function addItemToCart(cart, newItem) {
  const item = normalizeCartItem(newItem);
  if (!item) return cart;
  const existingIndex = cart.findIndex((i) => i.skuId === item.skuId && i.skuId);
  if (existingIndex >= 0) {
    const updated = [...cart];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + item.quantity,
    };
    return updated;
  }
  return [...cart, item];
}

export function removeItemFromCart(cart, skuId) {
  return cart.filter(item => item.skuId !== skuId);
}

export function updateItemQuantity(cart, skuId, quantity) {
  if (quantity <= 0) return removeItemFromCart(cart, skuId);
  return cart.map(item =>
    item.skuId === skuId ? { ...item, quantity } : item
  );
}

export function setItemPantryStatus(cart, skuId, fromPantry) {
  return cart.map(item =>
    item.skuId === skuId ? { ...item, fromPantry } : item
  );
}

export function clearCart() {
  clearCartStorage();
  return [];
}

export function getCartTotals(cart) {
  return calculateCartTotal(cart);
}

export async function validateCartAvailability(cart) {
  const results = await Promise.all(
    cart.map(async (item) => {
      const inventory = await getInventoryBySku(item.skuId);
      const available = getInventoryAvailableQuantity(inventory);
      return {
        skuId: item.skuId,
        requested: item.quantity,
        available,
        inStock: available >= item.quantity,
      };
    })
  );
  return results;
}

export function getInventoryAvailableQuantity(inventory) {
  if (!inventory) return 0;
  return Math.max(0, (inventory.available_quantity || 0) - (inventory.reserved_quantity || 0));
}

export async function addRecipeIngredientsToCart(cart, scaledIngredients, recipeId) {
  let updatedCart = [...cart];
  
  for (const ing of scaledIngredients) {
    if (ing.isPantryStaple) continue;
    if (!ing.product) continue;
    
    const inventory = await getInventoryBySku(ing.product.skuId);
    if (!inventory || !inventory.in_stock) {
      // Primary SKU unavailable: fall back to the first in-stock alternative.
      const alt = (ing.alternatives || []).find((a) => a.inStock) || null;
      if (alt) {
        const cartItem = normalizeCartItem({
          skuId: alt.skuId,
          name: alt.name,
          brand: alt.brand,
          packSize: alt.packSize,
          unit: alt.unit,
          price: alt.price,
          mrp: alt.mrp,
          image: alt.image,
          quantity: alt.packCount ?? ing.packOptimization?.packCount ?? 1,
          isVeg: true,
          fromPantry: false,
          recipeId,
          ingredientId: ing.ingredientId,
        });
        updatedCart = addItemToCart(updatedCart, cartItem);
      }
      continue;
    }

    const cartItem = buildCartItemFromScaledIngredient(ing, {
      fromPantry: false,
      recipeId,
      ingredientId: ing.ingredientId,
    });
    updatedCart = addItemToCart(updatedCart, cartItem);
  }

  saveCartToStorage(updatedCart);
  return updatedCart;
}

export function getCartItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartItemTypes(cart) {
  return cart.length;
}
