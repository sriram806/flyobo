"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const AuthLoader = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const loadUser = async () => {
    try {
      console.log("🔄 Loading user authentication...");
      
      const response = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
        timeout: 10000
      });

      if (response.data.success && response.data.user) {
        console.log("✅ User loaded:", response.data.user.name);
        dispatch(setAuthUser(response.data.user));
      } else {
        console.log("❌ No user found");
        dispatch(setAuthUser(null));
      }
    } catch (error) {
      console.log("❌ Auth check failed:", error.response?.status, error.response?.data?.message || error.message);
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
      console.warn("⚠️  API_URL not configured");
      setLoading(false);
      setAuthChecked(true);
    } else if (user) {
      console.log("ℹ️  User already loaded:", user.name);
      setLoading(false);
      setAuthChecked(true);
    }
  }, [API_URL, user, authChecked]);

  // Show loading spinner while checking authentication
  if (loading && !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthLoader;