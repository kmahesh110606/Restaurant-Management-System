import api from './client';

export const getOrders = (params = {}) =>
  api.get('/orders/', { params });

export const getOrder = (id) =>
  api.get(`/orders/${id}/`);

export const createOrder = (data) =>
  api.post('/orders/', data);

export const updateOrderStatus = (id, statusData) =>
  api.patch(`/orders/${id}/update_status/`, statusData);

export const trackOrder = (orderId) =>
  api.get('/orders/track/', { params: { order_id: orderId } });

export const getOrdersByTable = (restaurantSlug, tableNumber, phone) =>
  api.get('/orders/by_table/', {
    params: { restaurant: restaurantSlug, table: tableNumber, phone },
  });
