import api from './client';

export const getRestaurant = (slug) =>
  api.get(`/restaurants/${slug}/`);

export const getRestaurantPublic = (slug) =>
  api.get(`/restaurants/${slug}/public/`);

export const updateRestaurant = (slug, data) =>
  api.patch(`/restaurants/${slug}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getConfig = () =>
  api.get('/restaurants/');
