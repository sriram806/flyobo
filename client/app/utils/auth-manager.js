/**
 * Comprehensive Authentication Manager
 * Handles token management for both development and production environments
 */

import axios from 'axios';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';

class AuthManager {
  constructor() {
    this.token = null;
    this.isInitialized = false;
    this.setupAxiosInterceptors();
  }

  // Initialize the auth manager
  init() {
    if (typeof window === 'undefined') return;
    
    this.token = this.getStoredToken();
    this.setupAxiosDefaults();
    this.isInitialized = true;
    
    console.log('🔐 AuthManager initialized:', {
      hasToken: !!this.token,
      apiUrl: NEXT_PUBLIC_BACKEND_URL
    });
  }

  // Get API base URL
  getApiUrl() {
    const baseUrl = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) {
      console.error('❌ API URL not configured. Set NEXT_PUBLIC_BACKEND_URL');
      return null;
    }
    return baseUrl.replace(/\/$/, '');
  }

  // Get stored token from multiple sources
  getStoredToken() {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try localStorage first
      const localToken = localStorage.getItem('auth_token');
      if (localToken) return localToken;
      
      // Try sessionStorage as fallback
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) return sessionToken;
      
      // Try to extract from cookie as last resort
      const cookieToken = this.getTokenFromCookie();
      if (cookieToken) return cookieToken;
      
      return null;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Extract token from cookie
  getTokenFromCookie() {
    if (typeof document === 'undefined') return null;
    
    try {
      const tokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='));
      
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    } catch (error) {
      console.error('Error extracting token from cookie:', error);
      return null;
    }
  }

  // Store token securely
  setToken(token) {
    if (!token || typeof window === 'undefined') return;
    
    this.token = token;
    
    try {
      // Store in both localStorage and sessionStorage for redundancy
      localStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_token', token);
      
      // Update axios defaults
      this.setupAxiosDefaults();
      
      console.log('✅ Token stored successfully');
    } catch (error) {
      console.error('❌ Failed to store token:', error);
    }
  }

  // Clear all stored tokens
  clearToken() {
    this.token = null;
    
    if (typeof window === 'undefined') return;
    
    try {
      // Clear from storage
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      // Clear from axios
      delete axios.defaults.headers.common['Authorization'];
      
      // Try to clear cookies (best effort)
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname + ';';
      
      console.log('🗑️ All tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Setup axios defaults
  setupAxiosDefaults() {
    // Always send cookies
    axios.defaults.withCredentials = true;
    
    // Set Authorization header if we have a token
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Set base URL
    const apiUrl = this.getApiUrl();
    if (apiUrl) {
      axios.defaults.baseURL = apiUrl;
    }
  }

  // Setup axios interceptors
  setupAxiosInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        // Ensure we always send credentials
        config.withCredentials = true;
        
        // Add token to header if available and not already set
        const token = this.getStoredToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Ensure Content-Type is set
        if (!config.headers['Content-Type'] && config.data) {
          config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        // Check if response contains a new token
        const newToken = response.data?.token;
        if (newToken && newToken !== this.token) {
          this.setToken(newToken);
        }
        
        return response;
      },
      (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          console.warn('🚫 Authentication failed - clearing tokens');
          this.clearToken();
          
          // Optionally redirect to login or dispatch logout action
          if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
            window.location.href = '/';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Make authenticated request with multiple fallback strategies
  async makeRequest(config) {
    try {
      // Strategy 1: Try with both cookie and Authorization header
      const response = await axios({
        ...config,
        withCredentials: true,
        headers: {
          ...config.headers,
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        }
      });
      
      return response;
    } catch (error) {
      // Strategy 2: If 401, try refreshing token from cookie
      if (error.response?.status === 401) {
        const cookieToken = this.getTokenFromCookie();
        if (cookieToken && cookieToken !== this.token) {
          this.setToken(cookieToken);
          
          // Retry with new token
          try {
            const retryResponse = await axios({
              ...config,
              withCredentials: true,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${cookieToken}`
              }
            });
            
            return retryResponse;
          } catch (retryError) {
            console.error('Retry with cookie token failed:', retryError);
          }
        }
      }
      
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getStoredToken();
  }

  // Debug authentication state
  debug() {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 Authentication Debug:');
    console.log('─────────────────────────');
    console.log('API URL:', this.getApiUrl());
    console.log('Stored Token:', this.token ? `${this.token.substring(0, 20)}...` : 'NONE');
    console.log('Cookie Token:', this.getTokenFromCookie() ? 'PRESENT' : 'NONE');
    console.log('LocalStorage Token:', localStorage.getItem('auth_token') ? 'PRESENT' : 'NONE');
    console.log('Axios Auth Header:', axios.defaults.headers.common.Authorization ? 'PRESENT' : 'NONE');
    console.log('Current Domain:', window.location.hostname);
    console.log('Current Protocol:', window.location.protocol);
    console.log('─────────────────────────');
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Initialize on client side
if (typeof window !== 'undefined') {
  authManager.init();
  
  // Make debug function available globally
  window.authManager = authManager;
  window.debugAuth = () => authManager.debug();
}

export default authManager;