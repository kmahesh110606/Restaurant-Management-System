import api from './client';

export const getCategories = (params = {}) =>
  api.get('/categories/', { params });

export const getCategoriesNested = (restaurantSlug) =>
  api.get('/categories/', { params: { restaurant: restaurantSlug, nested: 'true' } });

export const createCategory = (data) =>
  api.post('/categories/', data);

export const updateCategory = (id, data) =>
  api.patch(`/categories/${id}/`, data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}/`);

export const getMenuItems = (params = {}) =>
  api.get('/menu-items/', { params });

export const getMenuItem = (id) =>
  api.get(`/menu-items/${id}/`);

export const createMenuItem = (data) =>
  api.post('/menu-items/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateMenuItem = (id, data) =>
  api.patch(`/menu-items/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteMenuItem = (id) =>
  api.delete(`/menu-items/${id}/`);
