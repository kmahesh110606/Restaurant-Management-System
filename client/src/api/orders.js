import api, { getCollection } from './client'; // Import custom Axios HTTP client instance

export const getOrders = (params = {}) => // Export function to fetch list of orders matching query filters
  getCollection('/orders/', params); // Execute GET request to /orders/ with query parameters

export const getOrder = (id) => // Export function to fetch details for a specific order by ID
  api.get(`/orders/${id}/`); // Execute GET request to /orders/{id}/

export async function createOrder(data) {
  const storageKey = `rms_pending_order_${data.restaurant_slug}`;
  const payload = JSON.stringify(data);
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
  if (!pending || pending.payload !== payload) pending = { payload, key: crypto.randomUUID() };
  try { sessionStorage.setItem(storageKey, JSON.stringify(pending)); } catch { /* In-page requests still carry the key. */ }
  const response = await api.post('/orders/', data, { headers: { 'Idempotency-Key': pending.key } });
  try { sessionStorage.removeItem(storageKey); } catch { /* No persistent state to clear. */ }
  return response;
}

export const updateOrderStatus = (id, statusData) => // Export function to update order status (e.g. Preparing, Ready, Delivered)
  api.patch(`/orders/${id}/update_status/`, statusData); // Execute PATCH request to custom update_status action endpoint

export const trackOrder = (orderId) => // Export function for customers to track order status by order ID
  api.get('/orders/track/', { params: { order_id: orderId } }); // Execute GET request to /orders/track/ with order_id param

export const getOrdersByTable = (restaurantSlug, tableNumber, phone) => // Export function to fetch orders associated with specific table and customer phone
  api.get('/orders/by_table/', { // Execute GET request to /orders/by_table/ endpoint
    params: { restaurant: restaurantSlug, table: tableNumber, phone }, // Pass restaurant slug, table number, and customer phone params
  }); // End getOrdersByTable function

