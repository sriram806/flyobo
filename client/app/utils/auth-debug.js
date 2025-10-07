/**
 * Authentication Debug Utilities
 * Use these functions to troubleshoot authentication issues
 */

import { getStoredToken } from './auth';

// Debug authentication state
export const debugAuth = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 Auth Debug: Running on server side');
    return;
  }

  console.log('🔍 Authentication Debug Information:');
  console.log('────────────────────────────────────');
  
  // Check environment
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log('🌐 API URL:', apiUrl || 'NOT SET');
  
  // Check stored token
  const token = getStoredToken();
  console.log('🎫 Stored Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
  
  // Check cookies
  const cookies = document.cookie;
  console.log('🍪 All Cookies:', cookies || 'NONE');
  
  const tokenCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  console.log('🎫 Token Cookie:', tokenCookie ? `${tokenCookie.substring(0, 30)}...` : 'NONE');
  
  // Check axios defaults
  const axiosAuth = window.axios?.defaults?.headers?.common?.Authorization;
  console.log('🔧 Axios Auth Header:', axiosAuth ? `${axiosAuth.substring(0, 30)}...` : 'NONE');
  
  // Check current domain and protocol
  console.log('🌍 Current Domain:', window.location.hostname);
  console.log('🔒 Current Protocol:', window.location.protocol);
  console.log('🚪 Current Port:', window.location.port);
  
  console.log('────────────────────────────────────');
};

// Test authentication endpoint
export const testAuth = async () => {
  if (typeof window === 'undefined') return;
  
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!apiUrl) {
    console.error('❌ Cannot test auth: API URL not configured');
    return;
  }
  
  console.log('🧪 Testing authentication endpoint...');
  
  try {
    // Import axios dynamically to avoid SSR issues
    const axios = (await import('axios')).default;
    
    const response = await axios.get(`${apiUrl}/user/me`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Auth test successful:', response.data);
  } catch (error) {
    console.error('❌ Auth test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.message
    });
  }
};

// Check CORS configuration
export const checkCORS = async () => {
  if (typeof window === 'undefined') return;
  
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!apiUrl) {
    console.error('❌ Cannot check CORS: API URL not configured');
    return;
  }
  
  console.log('🌐 Checking CORS configuration...');
  
  try {
    const axios = (await import('axios')).default;
    
    const response = await axios.options(apiUrl, {
      withCredentials: true
    });
    
    console.log('✅ CORS check successful:', {
      status: response.status,
      headers: response.headers
    });
  } catch (error) {
    console.error('❌ CORS check failed:', {
      status: error.response?.status,
      message: error.message
    });
  }
};

// Export debug functions to window for console access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.testAuth = testAuth;
  window.checkCORS = checkCORS;
  
  console.log('🔧 Auth debug utilities loaded. Use debugAuth(), testAuth(), or checkCORS() in console.');
}