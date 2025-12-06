import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";

// Lazy-load Redux to avoid circular dependency
const getRedux = () => {
  const { store } = require("@/redux/store");
  const { logout } = require("@/redux/authSlice");
  return { store, logout };
};

const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  } catch {
    return null;
  }
};

const forceLogout = () => {
  try {
    const { store, logout } = getRedux();
    store.dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie?.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }
  } catch (e) {
    // silent
  }
};

const createAuthenticatedRequest = () => {
  const token = getToken();
  return {
    withCredentials: true,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const createAuthenticatedFormRequest = () => {
  const token = getToken();
  return {
    withCredentials: true,
    timeout: 15000,
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

export const handleApiError = (error, customMessage = null) => {
  const status = error?.response?.status;
  const serverMsg = error?.response?.data?.message || "";
  let message = customMessage || "An error occurred";

  if (status === 401) {
    message = serverMsg || "Session expired. Please log in again.";
    toast.error(message);
    forceLogout();
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { route: "Login" } }));
      }
    } catch {
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.href = "/login";
      }, 500);
    }
    return { isAuthError: true, message };
  }

  if (status === 403) {
    message = serverMsg || "You don't have permission to perform this action.";
    toast.error(message);
  } else if (error?.code === "NETWORK_ERROR" || error?.message === "Network Error") {
    message = "Unable to connect to server. Please check your connection.";
    toast.error(message);
  } else if (status === 404) {
    message = serverMsg || "Resource not found.";
    toast.error(message);
  } else if (status >= 500) {
    message = "Server error. Please try again later.";
    toast.error(message);
  } else {
    message = serverMsg || error?.message || customMessage || "An error occurred";
    toast.error(message);
  }

  return { isAuthError: false, message };
};

export const authenticatedGet = async (url, params = {}) => {
  try {
    const config = createAuthenticatedRequest();
    if (params && Object.keys(params).length) config.params = params;
    const res = await axios.get(url, config);
    if (res.data?.success === false) throw new Error(res.data.message || "Request failed");
    return res.data;
  } catch (err) {
    handleApiError(err);
    throw err;
  }
};

export const authenticatedPost = async (url, data = {}) => {
  try {
    const config = createAuthenticatedRequest();
    const res = await axios.post(url, data, config);
    if (res.data?.success === false) throw new Error(res.data.message || "Request failed");
    return res.data;
  } catch (err) {
    handleApiError(err);
    throw err;
  }
};

export const authenticatedPostForm = async (url, formData) => {
  try {
    const config = createAuthenticatedFormRequest();
    const res = await axios.post(url, formData, config);
    if (res.data?.success === false) throw new Error(res.data.message || "Request failed");
    return res.data;
  } catch (err) {
    handleApiError(err);
    throw err;
  }
};

export const authenticatedPut = async (url, data = {}) => {
  try {
    const config = createAuthenticatedRequest();
    const res = await axios.put(url, data, config);
    if (res.data?.success === false) throw new Error(res.data.message || "Request failed");
    return res.data;
  } catch (err) {
    handleApiError(err);
    throw err;
  }
};

export const authenticatedDelete = async (url) => {
  try {
    const config = createAuthenticatedRequest();
    const res = await axios.delete(url, config);
    if (res.data?.success === false) throw new Error(res.data.message || "Request failed");
    return res.data;
  } catch (err) {
    handleApiError(err);
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL 
    const config = createAuthenticatedRequest();

    if (!API_URL) {
      // last-resort relative call
      await axios.post(`/api/v1/auth/logout`, {}, config).catch(() => {});
      forceLogout();
      return { success: true };
    }

    const res = await axios.post(`${API_URL}/auth/logout`, {}, config);
    forceLogout();
    return res.data;
  } catch (err) {
    forceLogout();
    throw err;
  }
};

const authRequest = {
  get: authenticatedGet,
  post: authenticatedPost,
  postForm: authenticatedPostForm,
  put: authenticatedPut,
  delete: authenticatedDelete,
  handleApiError,
  logoutUser,
};

export default authRequest;
