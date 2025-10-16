import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create an axios instance with default configuration
const createAuthenticatedRequest = () => {
  const config = {
    withCredentials: true,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return config;
};

// Create multipart form data request config
const createAuthenticatedFormRequest = () => {
  const config = {
    withCredentials: true,
    timeout: 15000,
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  };

  return config;
};

// Handle API errors consistently
const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || "An error occurred";
  
  if (error.response?.status === 401) {
    message = "Authentication required. Please log in again.";
    toast.error(message);
    // Redirect to login after a delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return { isAuthError: true, message };
  } else if (error.response?.status === 403) {
    message = "You don't have permission to perform this action.";
    toast.error(message);
  } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    message = "Unable to connect to server. Please check your connection.";
    toast.error(message);
  } else if (error.response?.status === 404) {
    message = error?.response?.data?.message || "Resource not found.";
    toast.error(message);
  } else if (error.response?.status >= 500) {
    message = "Server error. Please try again later.";
    toast.error(message);
  } else {
    message = error?.response?.data?.message || error?.message || customMessage || "An error occurred";
    toast.error(message);
  }
  
  return { isAuthError: false, message };
};

// Wrapper for authenticated GET requests
export const authenticatedGet = async (url, params = {}) => {
  try {
    const config = createAuthenticatedRequest();
    if (Object.keys(params).length > 0) {
      config.params = params;
    }
    
    const response = await axios.get(url, config);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || "Request failed");
    }
    
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error);
    throw error;
  }
};

// Wrapper for authenticated POST requests
export const authenticatedPost = async (url, data = {}) => {
  try {
    const config = createAuthenticatedRequest();
    const response = await axios.post(url, data, config);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || "Request failed");
    }
    
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error);
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

export default {
  get: authenticatedGet,
  post: authenticatedPost,
  postForm: authenticatedPostForm,
  put: authenticatedPut,
  delete: authenticatedDelete,
  handleApiError
};