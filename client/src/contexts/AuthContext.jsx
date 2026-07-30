/**
 * AuthContext — Manages JWT authentication state for staff users.
<<<<<<< HEAD
 * Supports username/password login (all staff) and Google OAuth (owners only).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginAPI, getMe, googleLogin as googleLoginAPI, signup as signupAPI } from '../api/auth';
=======
 */  // Module header docstring explaining AuthContext functionality

import { createContext, useContext, useState, useEffect, useCallback } from 'react';  // Import React hooks and context creator
import { login as loginAPI, getMe } from '../api/auth';  // Import login and profile API functions from auth.js
>>>>>>> b7ce8a3aaab13c0af968bde073b6b78f5ae8efd3

const AuthContext = createContext(null);  // Instantiate AuthContext with default null value

export function AuthProvider({ children }) {  // Export AuthProvider component to wrap application tree
  const [user, setUser] = useState(null);  // State hook for active authenticated user profile details
  const [role, setRole] = useState(null);  // State hook for active user staff role string
  const [restaurant, setRestaurant] = useState(null);  // State hook for active user associated restaurant details
  const [loading, setLoading] = useState(true);  // State hook for loading status during initial session validation check

  // Check for existing session on mount
  useEffect(() => {  // Lifecycle effect hook executed on component mount
    const token = localStorage.getItem('access_token');  // Check if JWT access token exists in browser localStorage
    if (token) {  // If token is present, validate active session
      getMe()  // Call getMe API endpoint to fetch user profile payload
        .then(({ data }) => {  // Success callback handling response payload
          setUser(data.user);  // Set authenticated user object
          setRole(data.role);  // Set user role string
          setRestaurant(data.restaurant);  // Set staff member's restaurant object
        })  // End then block
        .catch(() => {  // Error callback if token is expired or invalid
          localStorage.removeItem('access_token');  // Clear invalid access token from localStorage
          localStorage.removeItem('refresh_token');  // Clear invalid refresh token from localStorage
        })  // End catch block
        .finally(() => setLoading(false));  // Set loading state to false after promise settles
    } else {  // If no token exists in localStorage
      setLoading(false);  // Complete initial loading state immediately
    }  // End token check conditional
  }, []);  // Empty dependency array ensures effect runs only once on mount

  const login = useCallback(async (username, password) => {  // Define memoized async login function
    const { data } = await loginAPI(username, password);  // Execute login API request with credentials
    localStorage.setItem('access_token', data.access);  // Store received access token in localStorage
    localStorage.setItem('refresh_token', data.refresh);  // Store received refresh token in localStorage
    setUser(data.user);  // Update user state with user payload
    setRole(data.role);  // Update role state with user role string
    setRestaurant(data.restaurant);  // Update restaurant state with assigned restaurant payload
    return data;  // Return response data to caller
  }, []);  // Empty dependency array for login callback

<<<<<<< HEAD
  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await googleLoginAPI(credential);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
    setRole(data.role);
    setRestaurant(data.restaurant);
    return data;
  }, []);

  const signupRestaurant = useCallback(async (signupData) => {
    const { data } = await signupAPI(signupData);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
    setRole(data.role);
    setRestaurant(data.restaurant);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setRole(null);
    setRestaurant(null);
  }, []);
=======
  const logout = useCallback(() => {  // Define memoized logout handler function
    localStorage.removeItem('access_token');  // Remove access token from browser storage
    localStorage.removeItem('refresh_token');  // Remove refresh token from browser storage
    setUser(null);  // Reset user state to null
    setRole(null);  // Reset role state to null
    setRestaurant(null);  // Reset restaurant state to null
  }, []);  // Empty dependency array for logout callback
>>>>>>> b7ce8a3aaab13c0af968bde073b6b78f5ae8efd3

  const isAuthenticated = !!user;  // Boolean flag indicating if user is currently logged in
  const isAdmin = role === 'admin';  // Boolean helper indicating if logged-in user is an Admin
  const isWaiter = role === 'waiter';  // Boolean helper indicating if logged-in user is a Waiter
  const isKitchen = role === 'kitchen';  // Boolean helper indicating if logged-in user is Kitchen staff
  const isBiller = role === 'biller';  // Boolean helper indicating if logged-in user is a Biller

<<<<<<< HEAD
  return (
    <AuthContext.Provider
      value={{
        user, role, restaurant, loading,
        isAuthenticated, isAdmin, isWaiter, isKitchen, isBiller,
        login, loginWithGoogle, signupRestaurant, logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
=======
  return (  // Return context provider wrapping children components
    <AuthContext.Provider  {/* Mount AuthContext provider */}
      value={{  /* Provide value object to context consumers */
        user, role, restaurant, loading,  // Pass user, role, restaurant data and loading flag
        isAuthenticated, isAdmin, isWaiter, isKitchen, isBiller,  // Pass boolean permission flags
        login, logout,  // Pass login and logout handler functions
      }}  /* End context value prop */
    >  {/* Provider tag */}
      {children}  {/* Render child components inside provider */}
    </AuthContext.Provider>  {/* Close AuthContext provider */}
  );  // End return statement
}  // End AuthProvider component

export function useAuth() {  // Export custom hook to consume AuthContext
  const context = useContext(AuthContext);  // Retrieve current AuthContext value
  if (!context) throw new Error('useAuth must be used within an AuthProvider');  // Guard against usage outside AuthProvider
  return context;  // Return context value object
}  // End useAuth function
>>>>>>> b7ce8a3aaab13c0af968bde073b6b78f5ae8efd3

