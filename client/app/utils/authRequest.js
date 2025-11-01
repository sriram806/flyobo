import axios from 'axios';
import { toast } from 'react-hot-toast';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';

// Lazy-load Redux to avoid circular dependency
const getRedux = () => {
  const { store } = require('@/redux/store');
  const { logout } = require('@/redux/authSlice');
  return { store, logout };
};

// Helper: get token from storage safely
const getToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

// Helper: clear all auth state and storage
const forceLogout = () => {
  try {
    // Clear Redux auth state
    const { store, logout } = getRedux();
    store.dispatch(logout());

    // Clear storages
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies
      document.cookie?.split(';').forEach((c) => {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }
  } catch {}
};

// Create an axios request config with Authorization header
const createAuthenticatedRequest = () => {
  const token = getToken();
  const config = {
    withCredentials: true,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  };
  return config;
};

// Create multipart form data request config
const createAuthenticatedFormRequest = () => {
  const token = getToken();
  const config = {
    withCredentials: true,
    timeout: 15000,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  };
  return config;
};

// Handle API errors consistently
const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An error occurred';
  const status = error?.response?.status;
  const serverMsg = error?.response?.data?.message || '';

    if (status === 401) {
    // Token invalid or expired — force logout and open auth modal instead of full redirect
    message = serverMsg || 'Session expired. Please log in again.';
    toast.error(message);
    forceLogout();
    try {
      if (typeof window !== 'undefined') {
        // Use CustomEvent to request opening the auth modal
        window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { route: 'Login' } }));
      }
    } catch (e) {
      // fallback to redirect
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }, 500);
    }
    return { isAuthError: true, message };
  } else if (status === 403) {
    message = "You don't have permission to perform this action.";
    toast.error(message);
  } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    message = 'Unable to connect to server. Please check your connection.';
    toast.error(message);
  } else if (status === 404) {
    message = serverMsg || 'Resource not found.';
    toast.error(message);
  } else if (status >= 500) {
    message = 'Server error. Please try again later.';
    toast.error(message);
  } else {
    message = serverMsg || error?.message || customMessage || 'An error occurred';
    toast.error(message);
  }
  
  return { isAuthError: false, message };
};

// Wrapper for authenticated GET requests
export const authenticatedGet = async (url, params = {}) => {
  try {
    const config = createAuthenticatedRequest();
    if (params && Object.keys(params).length > 0) {
      config.params = params;
    }
    const response = await axios.get(url, config);
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Request failed');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Wrapper for authenticated POST requests
export const authenticatedPost = async (url, data = {}) => {
  try {
    const config = createAuthenticatedRequest();
    const response = await axios.post(url, data, config);
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Request failed');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Wrapper for authenticated multipart/form POST requests
export const authenticatedFormPost = async (url, formData) => {
  try {
    const config = createAuthenticatedFormRequest();
    const response = await axios.post(url, formData, config);
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Request failed');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Wrapper for authenticated POST requests with form data
export const authenticatedPostForm = async (url, formData) => {
  try {
    const config = createAuthenticatedFormRequest();
    const response = await axios.post(url, formData, config);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || "Request failed");
    }
    
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error);
    throw error;
  }
};

// Wrapper for authenticated PUT requests
export const authenticatedPut = async (url, data = {}) => {
  try {
    const config = createAuthenticatedRequest();
    const response = await axios.put(url, data, config);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || "Request failed");
    }
    
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error);
    throw error;
  }
};

// Wrapper for authenticated DELETE requests
export const authenticatedDelete = async (url) => {
  try {
    const config = createAuthenticatedRequest();
    const response = await axios.delete(url, config);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || "Request failed");
    }
    
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error);
    throw error;
  }
};

// Logout API call
export const logoutUser = async () => {
  try {
    const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!API_URL) {
      throw new Error('API base URL is not configured');
    }
    const config = createAuthenticatedRequest();
    const response = await axios.post(`${API_URL}/auth/logout`, {}, config);
    
    forceLogout();
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    forceLogout();
    throw error;
  }
};

export default {
  get: authenticatedGet,
  post: authenticatedPost,
  postForm: authenticatedPostForm,
  put: authenticatedPut,
  delete: authenticatedDelete,
  handleApiError,
  logoutUser
};