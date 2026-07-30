import api from './client';

export const login = (username, password) =>
  api.post('/auth/login/', { username, password });

export const getMe = () =>
  api.get('/auth/me/');

export const refreshToken = (refresh) =>
  api.post('/auth/token/refresh/', { refresh });

export const googleLogin = (idToken) =>
  api.post('/auth/google/', { id_token: idToken });

export const signup = (data) =>
  api.post('/auth/signup/', data);
