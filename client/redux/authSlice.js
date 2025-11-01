import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logoutUser as apiLogoutUser } from '@/app/utils/authRequest';

const initialState = {
  user: null,
  // Forgot password flow state
  forgot: {
    loading: false,
    error: null,
    message: null,
    email: null,
  },
  // Reset password flow state
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
    // Forgot password reducers
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
      if (action.payload?.email) state.forgot.email = action.payload.email;
    },
    forgotPasswordFailure: (state, action) => {
      state.forgot.loading = false;
      state.forgot.error = action.payload || "Something went wrong";
    },
    // Reset password reducers
    resetPasswordStart: (state, action) => {
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

// Async thunk to call server logout and clear client state
export const performLogout = createAsyncThunk(
  'auth/performLogout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Call server logout endpoint which clears cookie/session
      await apiLogoutUser();
      // Clear client storage and cookies
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          localStorage.clear();
          sessionStorage.clear();
          document.cookie?.split(';').forEach((c) => {
            const eqPos = c.indexOf('=');
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        }
      } catch (e) {}
      // Update redux state
      dispatch(logout());
      return true;
    } catch (err) {
      // Still perform client-side cleanup even if server call fails
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          localStorage.clear();
          sessionStorage.clear();
          document.cookie?.split(';').forEach((c) => {
            const eqPos = c.indexOf('=');
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        }
      } catch (e) {}
      dispatch(logout());
      return rejectWithValue(err?.message || 'Logout failed');
    }
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
