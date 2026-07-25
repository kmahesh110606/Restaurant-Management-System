import api from './client';

export const getStaff = (params = {}) =>
  api.get('/staff/', { params });

export const createStaff = (data) =>
  api.post('/staff/', data);

export const updateStaff = (id, data) =>
  api.patch(`/staff/${id}/`, data);

export const deleteStaff = (id) =>
  api.delete(`/staff/${id}/`);
