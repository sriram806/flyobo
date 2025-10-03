import { createSlice } from "@reduxjs/toolkit";

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
