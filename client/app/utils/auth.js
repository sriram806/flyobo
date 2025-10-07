/**
 * Authentication utilities for token management
 */

import axios from 'axios';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';

// Get the base API URL
export const getApiUrl = () => {
  const baseUrl = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    console.error('API base URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in environment variables.');
    return null;
  }
  return baseUrl.replace(/\/$/, '');
};

// Set up axios defaults for authentication
export const setupAxiosDefaults = () => {
  const token = getStoredToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Set up axios to always send cookies
  axios.defaults.withCredentials = true;
  
  // Request interceptor to add token
  axios.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token expiry
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        clearStoredToken();
        // Could redirect to login or dispatch logout action here
        console.warn('Authentication failed - token may be expired');
      }
      return Promise.reject(error);
    }
  );
};

// Get stored token from localStorage
export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

// Store token in localStorage
export const setStoredToken = (token) => {
  if (typeof window === 'undefined' || !token) return;
  try {
    localStorage.setItem('auth_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Failed to store auth token:', error);
  }
};

// Clear stored token
export const clearStoredToken = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

// Make authenticated request with fallback
export const makeAuthenticatedRequest = async (config) => {
  try {
    // First try with cookies (primary method)
    const response = await axios({
      ...config,
      withCredentials: true
    });
    return response;
  } catch (error) {
    // If cookie auth fails and we have a token, try with Authorization header
    const token = getStoredToken();
    if (token && error.response?.status === 401) {
      try {
        const response = await axios({
          ...config,
          withCredentials: true,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        });
        return response;
      } catch (headerError) {
        // Both methods failed, clear stored token
        clearStoredToken();
        throw headerError;
      }
    }
    throw error;
  }
};

// Initialize authentication on app start
export const initializeAuth = () => {
  setupAxiosDefaults();
};