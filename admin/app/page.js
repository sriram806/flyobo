"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setAuthUser } from "@/redux/authSlice";
import ThemeToggle from "./Utils/Themes/ThemeToggle";

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  React.useEffect(() => {
    let mounted = true;
    const doLogout = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (API_URL) {
          // call server logout to clear httpOnly cookie
          await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => null);
        }
      } catch (e) {
        console.error('Logout error', e);
      }

      try { localStorage.clear(); } catch (e) { }
      try { sessionStorage.clear(); } catch (e) { }

      try {
        if (typeof document !== 'undefined' && document.cookie) {
          document.cookie.split(';').forEach((c) => {
            const name = c.split('=')[0].trim();
            try {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            } catch (e) { }
          });
        }
      } catch (e) { }

      if (mounted) {
        try { dispatch(setAuthUser(null)); } catch (e) { }
      }
    };

    doLogout();
    return () => { mounted = false; };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrors({ email: "", password: "" });

      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

      if (!API_URL) {
        toast.error("Base API URL Missing!");
        setLoading(false);
        return;
      }

      const { data } = await axios.post(`${API_URL}/admin/login`, { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const token = data?.token;
      if (token) {
        try { localStorage.setItem("auth_token", token); } catch (e) { }
        try { sessionStorage.setItem("auth_token", token); } catch (e) { }
      }

      const user = data?.data?.user || data?.user;
      if (!user) throw new Error("User data not received from server");

      dispatch(setAuthUser(user));
      toast.success(data?.message || "Login successful");
      setTimeout(() => router.push('/dashboard'),100);
    } catch (err) {
      const respMsg = err?.response?.data?.message;
      if (respMsg && typeof respMsg === 'object') {
        try { setErrors(prev => ({ ...prev, ...respMsg })); } catch (e) { }
        toast.error('Validation error');
      } else {
        const msg = respMsg || err?.message || "Failed to sign in.";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 transition-all duration-500" />
      {/* Login Card */}
      <div className="
        w-full max-w-md p-8 rounded-3xl shadow-xl
        backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 
        border border-white/30 dark:border-gray-700
        relative z-10 transition-all duration-300
      ">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="
            text-4xl font-extrabold tracking-wide
            bg-linear-to-r from-sky-600 to-blue-500 
            dark:from-sky-400 dark:to-blue-300
            bg-clip-text text-transparent
          ">
            FlyOBO Admin
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Secure Administration Login
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl outline-none 
                bg-white/70 dark:bg-gray-900/40 
                border border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-gray-100
                shadow-sm
                focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                transition-all
              "
              placeholder="you@example.com"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl outline-none 
                bg-white/70 dark:bg-gray-900/40 
                border border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-gray-100
                shadow-sm
                focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                transition-all
              "
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-sky-600 dark:text-sky-400 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-linear-to-r from-sky-600 to-blue-500 
              hover:from-sky-700 hover:to-blue-600
              transition-all shadow-md hover:shadow-xl
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-5 p-3 text-center rounded-lg text-sm font-medium ${message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
              }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
