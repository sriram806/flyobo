"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setAuthUser, logout } from "@/redux/authSlice";
import ThemeToggle from "@/Utils/Themes/ThemeToggle";

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const clearSession = async () => {
      try {
        if (API_URL) {
          await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => null);
        }

        localStorage.clear();
        sessionStorage.clear();

        if (typeof document !== "undefined") {
          document.cookie.split(";").forEach((c) => {
            const name = c.split("=")[0].trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        }
      } catch { }
      dispatch(logout());
    };

    clearSession();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!API_URL) {
        toast.error("API base URL missing!");
        return;
      }

      const { data } = await axios.post(`${API_URL}/admin/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      const token = data?.token;
      const user = data?.data?.user || data?.user;

      if (!user) {
        toast.error("User data missing");
      }

      if (token) {
        localStorage.setItem("auth_token", token);
        sessionStorage.setItem("auth_token", token);
      }

      dispatch(setAuthUser({ token, user }));

      toast.success(data?.message || "Login successful");

      router.push("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div
        className="
        w-full max-w-md p-8 rounded-3xl shadow-xl
        backdrop-blur-xl bg-gray-200 dark:bg-gray-900
        border-2 border-sky-200 dark:border-gray-700
        relative z-10 transition-all duration-300
      "
      >
        <div className="text-center mb-6">
          <h1
            className="
            text-4xl font-extrabold tracking-wide
            bg-linear-to-r from-sky-600 to-blue-500
            dark:from-sky-400 dark:to-blue-300
            bg-clip-text text-transparent
          "
          >
            FlyOBO Admin
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Secure Administration Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
      </div>
    </main>
  );
}
