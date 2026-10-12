/**
 * Platform / Superadmin API endpoints.
 * Software-level administration for all registered restaurants,
 * cross-tenant users, master credential assistance, and security audit logs.
 */

import api from './client';

export const getPlatformRestaurants = () => api.get('/platform/restaurants/');

export const getPlatformSummary = () => api.get('/platform/summary/');

export const getPlatformUsers = () => api.get('/platform/users/');

export const getPlatformSafetyLogs = (params) => api.get('/platform/safety_logs/', { params });

export const resetOwnerPassword = (restaurantId, newPassword) =>
  api.post(`/platform/${restaurantId}/reset_owner_password/`, { new_password: newPassword });

export const resetUserPassword = (userId, newPassword) =>
  api.post('/platform/reset_user_password/', { user_id: userId, new_password: newPassword });

export const toggleRestaurantStatus = (restaurantId) =>
  api.post(`/platform/${restaurantId}/toggle_restaurant_status/`);
