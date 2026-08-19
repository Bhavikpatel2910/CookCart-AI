import { loadDataset } from './datasetApi.js';

const CART_STORAGE_KEY = 'cookcart_cart';

export function getCartFromStorage() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function clearCartStorage() {
  localStorage.removeItem(CART_STORAGE_KEY);
}

export async function getCartById(cartId) {
  const dataset = await loadDataset();
  return dataset.carts.find(c => c.cart_id === cartId) || null;
}

export async function getCartsByUser(userId) {
  const dataset = await loadDataset();
  return dataset.carts.filter(c => c.user_id === userId);
}