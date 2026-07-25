import api from './client';

export const getTables = (params = {}) =>
  api.get('/tables/', { params });

export const getTable = (id) =>
  api.get(`/tables/${id}/`);

export const createTable = (data) =>
  api.post('/tables/', data);

export const updateTable = (id, data) =>
  api.patch(`/tables/${id}/`, data);

export const deleteTable = (id) =>
  api.delete(`/tables/${id}/`);

export const regenerateQR = (id) =>
  api.post(`/tables/${id}/regenerate_qr/`);
