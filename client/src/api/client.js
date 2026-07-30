/**
 * Axios HTTP client with JWT interceptor.
 * Automatically attaches Authorization header and handles token refresh.
 */  // File header docstring explaining Axios configuration and auth interceptor duties

import axios from 'axios';  // Import Axios HTTP request library

const API_BASE = import.meta.env.VITE_API_URL || '';  // Retrieve backend base URL from Vite env variables or fallback to relative root

const api = axios.create({  // Create pre-configured Axios instance
  baseURL: `${API_BASE}/api/v1`,  // Set API base URL endpoint path
  headers: {  // Default request headers configuration object
    'Content-Type': 'application/json',  // Set default payload format header to JSON
  },  // Close headers object
  timeout: 30000,  // Set request timeout threshold to 30,000 milliseconds (30s)
});  // Close axios.create call

// Request interceptor: attach JWT access token
api.interceptors.request.use(  // Register interceptor function executed before outgoing HTTP requests
  (config) => {  // Receives outgoing request configuration object
    const token = localStorage.getItem('access_token');  // Retrieve stored JWT access token from localStorage
    if (token) {  // Check if access token is present
      config.headers.Authorization = `Bearer ${token}`;  // Attach Bearer token header to HTTP request
    }  // Close token conditional block
    return config;  // Return modified request configuration
  },  // End request handler function
  (error) => Promise.reject(error),  // Reject promise if request setup fails before sending
);  // Close request interceptor registration

// Response interceptor: handle 401 by refreshing token
api.interceptors.response.use(  // Register response interceptor function executed when response returns
  (response) => response,  // Pass through successful responses without modification
  async (error) => {  // Async error handler function for intercepting HTTP failure responses
    const originalRequest = error.config;  // Store reference to failed request config for retrying later

    if (  // Check if error condition matches token refresh requirements
      error.response?.status === 401 &&  // Check if response HTTP status code is 401 Unauthorized
      !originalRequest._retry &&  // Ensure this failed request has not already been retried once
      localStorage.getItem('refresh_token')  // Confirm refresh token exists in localStorage
    ) {  // Begin refresh execution block
      originalRequest._retry = true;  // Mark request flag to avoid infinite refresh retry loops

      try {  // Begin try block to attempt JWT token refresh
        const refreshToken = localStorage.getItem('refresh_token');  // Get stored refresh token from localStorage
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/token/refresh/`, {  // Send POST request to refresh token endpoint
          refresh: refreshToken,  // Include refresh token in request body
        });  // Await token refresh API response

        localStorage.setItem('access_token', data.access);  // Store newly issued JWT access token in localStorage
        if (data.refresh) {  // Check if API returned a new refresh token
          localStorage.setItem('refresh_token', data.refresh);  // Store updated refresh token in localStorage
        }  // End new refresh token check

        originalRequest.headers.Authorization = `Bearer ${data.access}`;  // Update Authorization header on original request with new access token
        return api(originalRequest);  // Re-run original failed request using updated credentials and return result
      } catch (refreshError) {  // Catch error if refresh attempt fails or refresh token expired
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem('access_token');  // Wipe access token from localStorage
        localStorage.removeItem('refresh_token');  // Wipe refresh token from localStorage
        window.location.href = '/login';  // Redirect browser to staff login page
        return Promise.reject(refreshError);  // Reject promise with refresh error details
      }  // Close try-catch block
    }  // End 401 refresh condition

    return Promise.reject(error);  // Pass through original error if not handled by refresh logic
  },  // End error handler callback
);  // Close response interceptor registration

export default api;  // Export configured Axios instance as default export

