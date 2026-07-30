/**
 * AuthContext — Manages JWT authentication state for staff users.
 * Supports username/password login (all staff) and Google OAuth (owners only).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginAPI, getMe, googleLogin as googleLoginAPI, signup as signupAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMe()
        .then(({ data }) => {
          setUser(data.user);
          setRole(data.role);
          setRestaurant(data.restaurant);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await loginAPI(username, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
    setRole(data.role);
    setRestaurant(data.restaurant);
    return data;
  }, []);

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

  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';
  const isWaiter = role === 'waiter';
  const isKitchen = role === 'kitchen';
  const isBiller = role === 'biller';

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
