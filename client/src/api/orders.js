import api from './client'; // Import custom Axios HTTP client instance

export const getOrders = (params = {}) => // Export function to fetch list of orders matching query filters
  api.get('/orders/', { params }); // Execute GET request to /orders/ with query parameters

export const getOrder = (id) => // Export function to fetch details for a specific order by ID
  api.get(`/orders/${id}/`); // Execute GET request to /orders/{id}/

export const createOrder = (data) => // Export function to place a new order
  api.post('/orders/', data); // Execute POST request to /orders/ with order item details

export const updateOrderStatus = (id, statusData) => // Export function to update order status (e.g. Preparing, Ready, Delivered)
  api.patch(`/orders/${id}/update_status/`, statusData); // Execute PATCH request to custom update_status action endpoint

export const trackOrder = (orderId) => // Export function for customers to track order status by order ID
  api.get('/orders/track/', { params: { order_id: orderId } }); // Execute GET request to /orders/track/ with order_id param

export const getOrdersByTable = (restaurantSlug, tableNumber, phone) => // Export function to fetch orders associated with specific table and customer phone
  api.get('/orders/by_table/', { // Execute GET request to /orders/by_table/ endpoint
    params: { restaurant: restaurantSlug, table: tableNumber, phone }, // Pass restaurant slug, table number, and customer phone params
  }); // End getOrdersByTable function

