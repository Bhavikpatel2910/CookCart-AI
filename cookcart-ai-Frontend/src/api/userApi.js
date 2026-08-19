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