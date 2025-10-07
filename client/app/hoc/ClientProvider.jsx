"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import Loading from "@/app/components/LoadingScreen/Loading";
import { initializeAuth } from "@/app/utils/auth";

const ClientProvider = ({ children }) => {
    useEffect(() => {
        // Initialize authentication utilities
        initializeAuth();
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
