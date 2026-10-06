import api from '../services/api.js';
import { loadDataset } from './datasetApi.js';

const USER_STORAGE_KEY = 'cookcart_user';

function buildUserIndex(users) {
  const byId = new Map();
  for (const user of users) {
    byId.set(user.user_id, user);
  }
  return byId;
}

let userIndex = null;

async function ensureIndex() {
  if (userIndex) return userIndex;
  const dataset = await loadDataset();
  userIndex = buildUserIndex(dataset.users);
  return userIndex;
}

export async function getAllUsers() {
  const dataset = await loadDataset();
  return dataset.users;
}

export async function getUserById(userId) {
  const index = await ensureIndex();
  return index.byId.get(userId) || null;
}

export function getCurrentUserFromStorage() {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setCurrentUserInStorage(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUserStorage() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export async function getDefaultUser() {
  const users = await getAllUsers();
  return users[0] || null;
}

// ---------- Server (MongoDB) sync ----------
// Upserts the signed-in user's profile in the database and returns the stored
// record (including their saved cart and favourites).
export async function syncUserToServer(profile, { updateName = false } = {}) {
  const { data } = await api.post('/users/sync', {
    userId: profile.user_id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    avatar: profile.avatar,
    provider: profile.provider,
    updateName,
  });
  return data.user;
}

export async function saveCartToServer(userId, items) {
  const slim = items.map((item) => ({
    skuId: item.skuId,
    name: item.name,
    brand: item.brand,
    packSize: item.packSize,
    unit: item.unit,
    price: item.price,
    mrp: item.mrp,
    image: item.image,
    quantity: item.quantity,
    isVeg: item.isVeg,
    category: item.category,
    fromPantry: item.fromPantry,
    recipeId: item.recipeId,
    ingredientId: item.ingredientId,
    addedAt: item.addedAt,
  }));
  await api.put(`/users/${encodeURIComponent(userId)}/cart`, { items: slim });
}

export async function saveFavoritesToServer(userId, favorites) {
  await api.put(`/users/${encodeURIComponent(userId)}/favorites`, { favorites });
}
