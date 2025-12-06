import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,
  forgot: {
    loading: false,
    error: null,
    message: null,
    email: null,
  },
  reset: {
    loading: false,
    error: null,
    message: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },

    // Forgot password
    forgotPasswordStart: (state, action) => {
      state.forgot.loading = true;
      state.forgot.error = null;
      state.forgot.message = null;
      state.forgot.email = action.payload?.email || null;
    },
    forgotPasswordSuccess: (state, action) => {
      state.forgot.loading = false;
      state.forgot.message = action.payload?.message || "";
      state.forgot.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.forgot.loading = false;
      state.forgot.error = action.payload || "Something went wrong";
    },

    // Reset password
    resetPasswordStart: (state) => {
      state.reset.loading = true;
      state.reset.error = null;
      state.reset.message = null;
    },
    resetPasswordSuccess: (state, action) => {
      state.reset.loading = false;
      state.reset.message = action.payload?.message || "";
      state.reset.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.reset.loading = false;
      state.reset.error = action.payload || "Something went wrong";
    },

    clearAuthErrors: (state) => {
      state.forgot.error = null;
      state.reset.error = null;
    },
  },
});

export const performLogout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      
      // Call backend logout endpoint
      if (API_URL && token) {
        try {
          await axios.post(
            `${API_URL}/auth/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
        } catch (apiError) {
          console.error("Backend logout error:", apiError?.message);
          // Continue with local logout even if API fails
        }
      }
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_token");
          localStorage.clear();
        }
      } catch (e) {
        console.error("Error clearing storage:", e);
      }
      dispatch(logout());
    }
    return true;
  }
);

export const {
  setAuthUser,
  logout,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  clearAuthErrors,
} = authSlice.actions;

export default authSlice.reducer;
