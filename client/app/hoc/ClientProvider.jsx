"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { logout } from "@/redux/authSlice";
import Loading from "@/app/components/LoadingScreen/Loading";

const ClientProvider = ({ children }) => {
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status;
                if (status === 401) {
                    try {
                        store.dispatch(logout());
                        if (typeof window !== 'undefined') {
                            localStorage.clear();
                            sessionStorage.clear();
                            document.cookie?.split(';').forEach((c) => {
                                const eqPos = c.indexOf('=');
                                const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
                                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                            });
                            // Avoid redirect loop if already on /login
                            if (!window.location.pathname.startsWith('/login')) {
                                // Dispatch a global event to open the auth modal instead of navigating
                                try {
                                    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { route: 'Login' } }));
                                } catch (e) {
                                    window.location.href = '/login';
                                }
                            }
                        }
                    } catch {}
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};

export default ClientProvider;
