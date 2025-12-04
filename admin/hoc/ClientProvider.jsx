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
        axios.defaults.withCredentials = true;

        const clearClientStorage = () => {
            localStorage.removeItem("auth_token");
            sessionStorage.removeItem("auth_token");
        };

        const clearCookies = () => {
            document.cookie.split(";").forEach((cookie) => {
                const name = cookie.split("=")[0].trim();
                document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
            });
        };

        const handle401 = (error) => {
            store.dispatch(logout());
            clearClientStorage();
            clearCookies();


            if (!window.location.pathname.startsWith('/')) {
                window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { route: 'Login' } }));
            }

            router.replace("/");
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
