import api, { getCollection } from './client'; // Import custom Axios HTTP client instance

export const getCategories = (params = {}) => // Export function to fetch list of categories with query parameters
  getCollection('/categories/', params); // Perform GET request to /categories/ with query params

export const getCategoriesNested = (restaurantSlug) => // Export function to fetch categories and nested menu items for customer menu view
  getCollection('/categories/', { restaurant: restaurantSlug, nested: 'true' }); // Perform GET request with restaurant slug and nested=true params

export const createCategory = (data) => // Export function to create a new menu category
  api.post('/categories/', data); // Perform POST request to /categories/ with category data

export const updateCategory = (id, data) => // Export function to update an existing menu category
  api.patch(`/categories/${id}/`, data); // Perform PATCH request to /categories/{id}/ with updated fields

export const deleteCategory = (id) => // Export function to delete a category by ID
  api.delete(`/categories/${id}/`); // Perform DELETE request to /categories/{id}/

export const getMenuItems = (params = {}) => // Export function to fetch list of menu items with optional filters
  getCollection('/menu-items/', params); // Perform GET request to /menu-items/ with query params

export const getMenuItem = (id) => // Export function to fetch details for a single menu item
  api.get(`/menu-items/${id}/`); // Perform GET request to /menu-items/{id}/

export const createMenuItem = (data) => // Export function to create a new menu item with optional image file upload
  api.post('/menu-items/', data); // Perform POST request to create menu item

export const updateMenuItem = (id, data) => // Export function to update an existing menu item with optional image upload
  api.patch(`/menu-items/${id}/`, data); // Perform PATCH request to update menu item

export const deleteMenuItem = (id) => // Export function to remove a menu item by ID
  api.delete(`/menu-items/${id}/`); // Perform DELETE request to /menu-items/{id}/

