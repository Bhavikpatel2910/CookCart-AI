import api from '../services/api.js';
import { getCurrentUserFromStorage } from './userApi.js';

function currentUserId(explicit) {
  if (explicit) return explicit;
  return getCurrentUserFromStorage()?.user_id ?? null;
}

// Convert a server order into the display shape the order pages render.
export function mapServerOrder(order) {
  if (!order) return null;
  const pricing = order.pricing || {};
  const itemDetails = (order.items || []).map((item) => ({
    sku_id: item.skuId,
    name: item.name,
    brand: item.brand ?? null,
    image: item.image ?? null,
    packSize: item.packSize ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    lineTotal: item.lineTotal,
  }));
  return {
    order_id: order.orderId,
    user_id: order.userId,
    recipe_id: order.recipeId,
    recipeName: order.recipeName || 'Grocery order',
    recipeSlug: order.recipeSlug || null,
    recipeImage: order.recipeImage || null,
    servings: order.servings ?? null,
    created_at: order.placedAt || order.createdAt,
    delivery_status: order.status,
    status: order.status,
    subtotal: pricing.subtotal ?? 0,
    discount: pricing.pantrySavings ?? 0,
    delivery_fee: pricing.deliveryFee ?? 0,
    packaging_fee: pricing.packagingFee ?? 0,
    total: pricing.total ?? 0,
    delivery_method: order.delivery?.method,
    payment_method: order.payment?.method,
    address: order.address || null,
    itemDetails,
    itemCount: itemDetails.reduce((sum, it) => sum + (it.quantity || 0), 0),
  };
}

// Persist a new order for the signed-in user. Rejects if the server is down so
// the caller can keep the basket instead of silently losing it.
export async function placeOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return mapServerOrder(data.order);
}

// The signed-in user's order history, newest first.
export async function getAllOrdersDisplay(userId) {
  const id = currentUserId(userId);
  if (!id) return [];
  const { data } = await api.get('/orders', { params: { userId: id } });
  return (data.orders || []).map(mapServerOrder);
}

// One order of the signed-in user; with no id, their most recent order.
export async function getOrderDisplay(orderId, userId) {
  const id = currentUserId(userId);
  if (!id) return null;
  if (!orderId) {
    const all = await getAllOrdersDisplay(id);
    return all[0] || null;
  }
  try {
    const { data } = await api.get(`/orders/${encodeURIComponent(orderId)}`, { params: { userId: id } });
    return mapServerOrder(data.order);
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
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
