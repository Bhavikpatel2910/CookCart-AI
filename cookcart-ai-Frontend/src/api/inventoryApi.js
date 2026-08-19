import { loadDataset } from './datasetApi.js';

function buildInventoryIndex(inventory) {
  const bySku = new Map();
  for (const item of inventory) {
    bySku.set(item.sku_id, item);
  }
  return { bySku };
}

let inventoryIndex = null;

async function ensureIndex() {
  if (inventoryIndex) return inventoryIndex;
  const dataset = await loadDataset();
  inventoryIndex = buildInventoryIndex(dataset.inventory);
  return inventoryIndex;
}

export async function getInventoryBySku(skuId) {
  const index = await ensureIndex();
  return index.bySku.get(skuId) || null;
}

export async function getAllInventory() {
  const dataset = await loadDataset();
  return dataset.inventory;
}

export function getStockStatus(inventoryItem) {
  if (!inventoryItem) return 'unknown';
  if (!inventoryItem.in_stock) return 'out_of_stock';
  if (inventoryItem.low_stock) return 'low_stock';
  return 'in_stock';
}

export function isInStock(inventoryItem) {
  return inventoryItem?.in_stock === true;
}

export function isLowStock(inventoryItem) {
  return inventoryItem?.low_stock === true;
}

export function getAvailableQuantity(inventoryItem) {
  if (!inventoryItem) return 0;
  return Math.max(0, (inventoryItem.available_quantity || 0) - (inventoryItem.reserved_quantity || 0));
}