"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const AuthDebugger = () => {
  const user = useSelector((state) => state?.auth?.user);
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const checkAuthentication = async () => {
    setLoading(true);
    const info = {
      reduxUser: user ? "Present" : "Not found",
      cookies: document.cookie || "No cookies",
      localStorage: {},
      apiTest: "Not tested",
      timestamp: new Date().toISOString()
    };

    // Check localStorage
    try {
      info.localStorage = {
        authToken: localStorage.getItem("auth_token") || "Not found",
        userInfo: localStorage.getItem("user") || "Not found"
      };
    } catch (e) {
      info.localStorage = { error: "Cannot access localStorage" };
    }

    // Test API call
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
        timeout: 5000
      });
      info.apiTest = response.data.success ? "Success" : `Failed: ${response.data.message}`;
    } catch (error) {
      info.apiTest = `Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    checkAuthentication();
  }, [user]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Auth Debug</h3>
        <button
          onClick={checkAuthentication}
          disabled={loading}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>
      
      <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
        <div><strong>Redux User:</strong> {debugInfo.reduxUser}</div>
        <div><strong>API Test:</strong> {debugInfo.apiTest}</div>
        <div><strong>Cookies:</strong> {debugInfo.cookies?.substring(0, 50)}...</div>
        <div><strong>Auth Token:</strong> {debugInfo.localStorage?.authToken?.substring(0, 20)}...</div>
        <div><strong>Last Check:</strong> {debugInfo.timestamp?.split('T')[1]?.substring(0, 8)}</div>
      </div>

      {user && (
        <div className="mt-2 text-xs">
          <strong>User:</strong> {user.name} ({user.role})
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;