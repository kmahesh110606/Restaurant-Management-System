import api, { getCollection } from './client'; // Import custom Axios HTTP client instance

export const getTokens = (params = {}) => // Export function to fetch customer queue token entries
  getCollection('/tokens/', params); // Execute GET request to /tokens/ with query filters

export const createToken = () => // Export function to generate a new customer queue token
  api.post('/tokens/', {}); // Execute POST request to /tokens/ endpoint

export const updateToken = (id, data) => // Export function to update customer token status (e.g. Called, Seated)
  api.patch(`/tokens/${id}/`, data); // Execute PATCH request to /tokens/{id}/ with status data

