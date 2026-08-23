import { loadDataset } from './datasetApi.js';
import { getRecipeImageUrl, getProductImageUrl } from '../utils/imageUtils.js';
import api from '../services/api.js';

// Places a real order against the backend. The order is stored in MongoDB
// against the logged-in user (identified via the JWT sent by services/api.js).
export async function placeOrder({
  items,
  address,
  recipeId,
  deliveryMethod,
  paymentMethod,
  deliveryFee,
  packagingFee,
}) {
  const payload = {
    items: items.map((item) => ({
      sku_id: item.skuId ?? item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    })),
    address,
    recipe_id: recipeId || undefined,
    deliveryMethod,
    paymentMethod,
    deliveryFee,
    packagingFee,
  };

  const { data } = await api.post('/orders', payload);
  return data.order;
}

// Fetches the logged-in user's orders from the backend.
export async function getMyOrders() {
  const { data } = await api.get('/orders');
  return data.orders;
}

// Fetches a single order (must belong to the logged-in user) from the backend.
export async function getMyOrderById(orderId) {
  const { data } = await api.get(`/orders/${orderId}`);
  return data.order;
}

export async function getOrderById(orderId) {
  const dataset = await loadDataset();
  return dataset.orders.find(o => o.order_id === orderId) || null;
}

export async function getOrdersByUser(userId) {
  const dataset = await loadDataset();
  return dataset.orders.filter(o => o.user_id === userId);
}

export async function getAllOrders() {
  const dataset = await loadDataset();
  return dataset.orders;
}

// Join an order with its recipe and products so the UI can render real names
// and images instead of generic placeholders.
export async function enrichOrders(orders) {
  const dataset = await loadDataset();
  const recipeIndex = new Map(dataset.recipes.map((r) => [r.recipe_id, r]));
  const productIndex = new Map(dataset.products.map((p) => [p.sku_id, p]));

  return orders.map((order) => {
    const recipe = recipeIndex.get(order.recipe_id);
    const itemDetails = (order.items || []).map((it) => {
      const product = productIndex.get(it.sku_id);
      return {
        sku_id: it.sku_id,
        name: product?.product_name ?? 'Item',
        brand: product?.brand ?? null,
        image: product ? getProductImageUrl(product) : null,
        quantity: it.quantity,
        unit_price: it.unit_price,
        lineTotal: (it.unit_price || 0) * (it.quantity || 1),
      };
    });
    return {
      ...order,
      recipeName: recipe?.name ?? 'Order',
      recipeSlug: recipe?.slug ?? null,
      recipeImage: recipe ? getRecipeImageUrl(recipe) : null,
      dishCategory: recipe?.dish_category ?? null,
      itemDetails,
      itemCount: (order.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0),
    };
  });
}

export async function getAllOrdersDisplay() {
  const orders = await getAllOrders();
  return enrichOrders(orders).then((list) =>
    // Most recent first
    [...list].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
  );
}

export async function getOrderDisplay(orderId) {
  const orders = await getAllOrders();
  const order =
    (orderId && orders.find((o) => o.order_id === orderId)) || orders[0];
  if (!order) return null;
  const [enriched] = await enrichOrders([order]);
  return enriched;
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const DELIVERY_STATUSES = [
  'pending',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
];

export const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  assigned: 'Rider assigned',
  picked_up: 'Picked up',
  in_transit: 'On the way',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
};
