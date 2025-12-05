"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import { useRouter } from "next/navigation";

const ClientProvider = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        axios.defaults.withCredentials = true;
        try {
            let token = null;
            if (typeof window !== 'undefined') {
                try { token = localStorage.getItem('auth_token'); } catch (e) { token = null; }
            }
            if (!token) {
                try {
                    const s = store.getState && store.getState();
                    token = s?.auth?.token || null;
                } catch (e) {
                    token = null;
                }
            }
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
        }

        const clearClientStorage = () => {
            try { localStorage.removeItem("auth_token"); } catch (e) {}
            try { sessionStorage.removeItem("auth_token"); } catch (e) {}
        };

        const clearCookies = () => {
            try {
                document.cookie.split(";").forEach((cookie) => {
                    const name = cookie.split("=")[0].trim();
                    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
                });
            } catch (e) {}
        };

        const handle401 = (error) => {
            try { store.dispatch(logout()); } catch (e) {}
            clearClientStorage();
            clearCookies();

            try {
                if (!window.location.pathname.startsWith('/')) {
                    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { route: 'Login' } }));
                }
            } catch (e) {}

            try { router.replace("/"); } catch (e) {}
            return Promise.reject(error);
        };

        const interceptor = axios.interceptors.response.use(
            res => res,
            err => {
                if (err?.response?.status === 401) return handle401(err);
                return Promise.reject(err);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [router]);

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};

export default ClientProvider;
