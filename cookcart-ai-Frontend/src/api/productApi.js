import { loadDataset } from './datasetApi.js';

function buildProductIndex(products) {
  const bySku = new Map();
  const byIngredient = new Map();
  for (const product of products) {
    bySku.set(product.sku_id, product);
    if (!byIngredient.has(product.ingredient_id)) {
      byIngredient.set(product.ingredient_id, []);
    }
    byIngredient.get(product.ingredient_id).push(product);
  }
  return { bySku, byIngredient };
}

let productIndex = null;

async function ensureIndex() {
  if (productIndex) return productIndex;
  const dataset = await loadDataset();
  productIndex = buildProductIndex(dataset.products);
  return productIndex;
}

export async function getAllProducts() {
  const dataset = await loadDataset();
  return dataset.products;
}

export async function getProductBySku(skuId) {
  const index = await ensureIndex();
  return index.bySku.get(skuId) || null;
}

export async function getProductsByIngredient(ingredientId) {
  const index = await ensureIndex();
  return index.byIngredient.get(ingredientId) || [];
}

export async function getProductsByIds(skuIds) {
  const index = await ensureIndex();
  return skuIds.map(id => index.bySku.get(id)).filter(Boolean);
}

export async function getProductsByCategory(category) {
  const index = await ensureIndex();
  return [...index.bySku.values()].filter(p => p.category === category);
}

export async function getProductsByBrand(brand) {
  const index = await ensureIndex();
  return [...index.bySku.values()].filter(p => p.brand === brand);
}