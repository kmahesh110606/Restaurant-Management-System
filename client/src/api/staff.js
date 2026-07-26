import api from './client'; // Import custom Axios HTTP client instance

export const getStaff = (params = {}) => // Export function to fetch list of restaurant staff members
  api.get('/staff/', { params }); // Execute GET request to /staff/ with query filters

export const createStaff = (data) => // Export function to create a new staff profile user account
  api.post('/staff/', data); // Execute POST request to /staff/ with user data

export const updateStaff = (id, data) => // Export function to update staff profile details (e.g. role, shift, status)
  api.patch(`/staff/${id}/`, data); // Execute PATCH request to /staff/{id}/ with updated fields

export const deleteStaff = (id) => // Export function to remove/deactivate a staff member by ID
  api.delete(`/staff/${id}/`); // Execute DELETE request to /staff/{id}/ endpoint

