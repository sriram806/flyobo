"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import Loading from "@/app/components/LoadingScreen/Loading";
import authManager from "@/app/utils/auth-manager";

const ClientProvider = ({ children }) => {
    useEffect(() => {
        // Initialize authentication manager
        authManager.init();
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
