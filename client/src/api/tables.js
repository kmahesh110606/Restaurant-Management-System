import api from './client'; // Import custom Axios HTTP client instance

export const getTables = (params = {}) => // Export function to fetch list of dining tables with optional filters
  api.get('/tables/', { params }); // Execute GET request to /tables/ with query parameters

export const getTable = (id) => // Export function to fetch single dining table details by ID
  api.get(`/tables/${id}/`); // Execute GET request to /tables/{id}/

export const createTable = (data) => // Export function to create a new dining table entry
  api.post('/tables/', data); // Execute POST request to /tables/ with table details

export const updateTable = (id, data) => // Export function to update table parameters (e.g. status, capacity)
  api.patch(`/tables/${id}/`, data); // Execute PATCH request to /tables/{id}/ with updated fields

export const deleteTable = (id) => // Export function to delete a dining table by ID
  api.delete(`/tables/${id}/`); // Execute DELETE request to /tables/{id}/

export const regenerateQR = (id) => // Export function to regenerate table QR code image
  api.post(`/tables/${id}/regenerate_qr/`); // Execute POST request to custom /tables/{id}/regenerate_qr/ endpoint

