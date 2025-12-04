"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";
import Loading from "../Loading/Loading";

const AuthLoader = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const user = useSelector((state) => state?.auth?.user);
    const dispatch = useDispatch();

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const loadUser = async () => {
        try {
            if (!API_URL) {
                console.warn("⚠️  API_URL not configured");
                dispatch(setAuthUser(null));
                setLoading(false);
                setAuthChecked(true);
                return;
            }

            const response = await axios.get(`${API_URL}/user/profile`, {
                withCredentials: true,
                timeout: 10000
            });

            if (response.data.success && response.data.user === "admin") {
                console.success("User loaded:", response.data.user.name);
                dispatch(setAuthUser(response.data.user));
            } else {
                dispatch(setAuthUser(null));
            }
        } catch (error) {
            dispatch(setAuthUser(null));
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }
    };

    useEffect(() => {
        if (!authChecked && !user && API_URL) {
            loadUser();
        } else if (!API_URL) {
            console.warn("API_URL not configured");
            setLoading(false);
            setAuthChecked(true);
        } else if (user) {
            console.log("User already loaded:", user.name);
            setLoading(false);
            setAuthChecked(true);
        }
    }, [API_URL, user, authChecked]);

    if (loading && !authChecked) {
        return (
            <Loading />
        );
    }

    return children;
};

export default AuthLoader;