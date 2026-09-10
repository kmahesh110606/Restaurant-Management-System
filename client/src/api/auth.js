import api from './client'; // Import customized Axios API client instance

export const login = (username, password) => // Export function to authenticate staff with username and password
  api.post('/auth/login/', { username, password }); // Send POST request to login endpoint with login credentials

export const getMe = () => // Export function to fetch current authenticated user profile details
  api.get('/auth/me/'); // Send GET request to fetch current active staff user payload

export const refreshToken = (refresh) =>
  api.post('/auth/token/refresh/', { refresh });

export const googleLogin = (idToken) =>
  api.post('/auth/google/', { id_token: idToken });

export const signup = (data) =>
  api.post('/auth/signup/', data);

