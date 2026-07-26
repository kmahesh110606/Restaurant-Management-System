import api from './client'; // Import configured Axios client instance with base URL and auth interceptors

export const getRestaurant = (slug) => // Export function to fetch detailed restaurant info by slug for authenticated staff
  api.get(`/restaurants/${slug}/`); // Execute GET request to /restaurants/{slug}/ endpoint

export const getRestaurantPublic = (slug) => // Export function to fetch public-facing restaurant info by slug for customers
  api.get(`/restaurants/${slug}/public/`); // Execute GET request to /restaurants/{slug}/public/ endpoint

export const updateRestaurant = (slug, data) => // Export function to update restaurant settings (with file upload support)
  api.patch(`/restaurants/${slug}/`, data, { // Execute PATCH request to update restaurant details
    headers: { 'Content-Type': 'multipart/form-data' }, // Set multipart header to allow image upload payload
  }); // End patch call configuration

export const getConfig = () => // Export function to retrieve list/configuration of all accessible restaurants
  api.get('/restaurants/'); // Execute GET request to root restaurants API endpoint

