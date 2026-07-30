import api from './client'; // Import custom Axios HTTP client instance

export const getRecipes = (params = {}) => // Export function to fetch recipes with optional query parameters
  api.get('/recipes/', { params }); // Execute GET request to /recipes/ endpoint

export const getRecipe = (id) => // Export function to fetch single recipe definition by ID
  api.get(`/recipes/${id}/`); // Execute GET request to /recipes/{id}/ endpoint

export const createRecipe = (data) => // Export function to create recipe ingredient list for a menu item
  api.post('/recipes/', data); // Execute POST request to /recipes/ with payload

export const updateRecipe = (id, data) => // Export function to update recipe details or quantities
  api.patch(`/recipes/${id}/`, data); // Execute PATCH request to /recipes/{id}/ endpoint

export const deleteRecipe = (id) => // Export function to delete recipe entry by ID
  api.delete(`/recipes/${id}/`); // Execute DELETE request to /recipes/{id}/ endpoint

