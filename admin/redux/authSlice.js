import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthUser: (state, action) => {
            if (!action.payload) {
                return;
            }
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.user = null;
        }
    }
});

const clearClientAuth = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");

    document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; Max-Age=0; Path=/;`;
    });
};

// 🔥 Async logout
export const performLogout = createAsyncThunk(
    "auth/performLogout",
    async (_, { dispatch }) => {
        try {
            // 1. Server logout — clears HTTP-Only cookie
            await apiLogoutUser();
        } catch (error) {
            // Ignore server errors — we still logout client-side
        }

        // 2. Client cleanup
        clearClientAuth();

        // 3. Reset redux state
        dispatch(logout());

        return true;
    }
);

export const { setAuthUser, logout } = authSlice.actions;
export default authSlice.reducer;
