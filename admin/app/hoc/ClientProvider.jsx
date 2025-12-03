"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ClientProvider = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        try {
            axios.defaults.withCredentials = true;
        } catch (e) {}

        const clearClientStorage = () => {
            try {
                if (typeof window === 'undefined') return;
                localStorage.removeItem("auth_token");
                sessionStorage.removeItem("auth_token");
            } catch (e) {
            }
        };

        const clearCookies = () => {
            try {
                if (typeof document === 'undefined') return;
                document.cookie.split(";").forEach((cookie) => {
                    const name = cookie.split("=")[0].trim();
                    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
                });
            } catch (e) {
            }
        };

        const handle401 = (error) => {
            try {
                store.dispatch(logout());
                clearClientStorage();
                clearCookies();

                try { toast.error('Session expired. Please sign in again.'); } catch (e) {}


                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    try {
                        window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { route: 'Login' } }));
                    } catch (e) {}

                    setTimeout(() => {
                        try {
                            if (!window.location.pathname.startsWith('/')) {
                                window.location.href = '/';
                            }
                        } catch (e) {}
                    }, 350);
                }
                router.replace("/");
            } catch (e) {
            }
            return Promise.reject(error);
        };

        const interceptor = axios.interceptors.response.use(res => res, err => {
            if (err?.response?.status === 401) return handle401(err);
            return Promise.reject(err);
        });

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};

export default ClientProvider;
