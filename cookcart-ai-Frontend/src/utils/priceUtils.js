export function formatPrice(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPriceWithDecimals(amount, decimals = 2) {
  if (amount === undefined || amount === null) return '₹0.00';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function calculateLineTotal(price, quantity) {
  return Number(price) * Number(quantity || 1);
}

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.price, item.quantity), 0);
}

export function calculatePantrySavings(items) {
  return items
    .filter(item => item.fromPantry)
    .reduce((sum, item) => sum + calculateLineTotal(item.price, item.quantity), 0);
}

export function calculateDiscount(subtotal, discountPercent = 0) {
  return Math.round(subtotal * (discountPercent / 100) * 100) / 100;
}

export function calculateDeliveryFee(subtotal, deliveryOption = 'standard') {
  if (deliveryOption === 'express') return 29;
  if (deliveryOption === 'none') return 0;
  if (subtotal >= 499) return 0;
  return 19;
}

export function calculatePackagingFee() {
  return 12;
}

export function calculateCartTotal(items, options = {}) {
  const subtotal = calculateSubtotal(items);
  const pantrySavings = calculatePantrySavings(items);
  const discount = calculateDiscount(subtotal, options.discountPercent);
  const deliveryFee = calculateDeliveryFee(subtotal - discount, options.deliveryOption);
  const packagingFee = options.includePackaging !== false ? calculatePackagingFee() : 0;
  const total = Math.max(0, subtotal - pantrySavings - discount + deliveryFee + packagingFee);
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    pantrySavings: Math.round(pantrySavings * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    packagingFee: Math.round(packagingFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function calculateRecipeEstimatedCost(ingredients) {
  const total = ingredients.reduce((sum, ing) => {
    if (ing.product && !ing.isPantryStaple) {
      return sum + (ing.product.price * (ing.packOptimization?.packCount || 1));
    }
    return sum;
  }, 0);
  return Math.round(total * 100) / 100;
}

export function calculateSavings(originalPrice, salePrice) {
  return Math.round((originalPrice - salePrice) * 100) / 100;
}

export function calculateDiscountPercent(originalPrice, salePrice) {
  if (!originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}