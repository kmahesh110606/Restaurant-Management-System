import api from './client';

export const getRecipes = (params = {}) =>
  api.get('/recipes/', { params });

export const getRecipe = (id) =>
  api.get(`/recipes/${id}/`);

export const createRecipe = (data) =>
  api.post('/recipes/', data);

export const updateRecipe = (id, data) =>
  api.patch(`/recipes/${id}/`, data);

export const deleteRecipe = (id) =>
  api.delete(`/recipes/${id}/`);
