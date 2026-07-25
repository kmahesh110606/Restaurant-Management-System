import api from './client';

export const getTokens = (params = {}) =>
  api.get('/tokens/', { params });

export const createToken = () =>
  api.post('/tokens/', {});

export const updateToken = (id, data) =>
  api.patch(`/tokens/${id}/`, data);
