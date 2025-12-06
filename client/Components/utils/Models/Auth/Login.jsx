"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import ModalHeader from "../components/ModalHeader";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";

export default function Login({ setRoute, setOpen }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: "", password: "" });
    if (!API_URL) {
      toast.error("Base API URL missing");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_URL}/auth/login`,
        { email, password, remember },
        { withCredentials: true, headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );

      const token = data?.token;
      if (token) {
        try { localStorage.setItem("auth_token", token); } catch {}
        try { sessionStorage.setItem("auth_token", token); } catch {}
        try { axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; } catch {}
      }

      const user = data?.user || data?.data?.user;
      if (!user) throw new Error(data?.message || "User data not received");
      dispatch(setAuthUser(user));
      if (setOpen) setOpen(false);
      toast.success(data?.message || "Login successful");
      
      // Redirect manager to admin page
      if (user.role === "manager") {
        router.push("/admin");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to sign in.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const openOAuthPopup = (url) => {
    try {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      const popup = window.open(url, "oauth", `width=${width},height=${height},left=${left},top=${top}`);
      if (!popup) {
        toast.error("Popup blocked. Allow popups and try again.");
        return;
      }

      const listener = (e) => {
        const payload = e.data || {};
        const token = payload.token;
        const user = payload.user;
        if (token) {
          try { localStorage.setItem("auth_token", token); } catch {}
          try { axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; } catch {}
        }
        if (user) {
          dispatch(setAuthUser(user));
          if (user.role === "manager") {
            router.push("/admin");
          }
        }
        if (setOpen) setOpen(false);
        toast.success("Login successful");
      };

      window.addEventListener("message", listener, { once: true });
    } catch {
      toast.error("OAuth failed");
    }
  };

  const isFormValid = email.length > 0 && password.length >= 6 && !loading;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg transition-all duration-300">
      <ModalHeader title="Sign in to Flyobo" description="Welcome back! Please enter your details." />

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none transition ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-sky-500 dark:focus:border-sky-400`}
            autoComplete="email"
            required
          />
          <label htmlFor="email" className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all top-0 -translate-y-1/2 text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs">
            Email
          </label>
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`peer w-full bg-transparent border-2 rounded-xl h-14 pr-12 px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none transition ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-sky-500 dark:focus:border-sky-400`}
            autoComplete="current-password"
            required
          />
          <label htmlFor="password" className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all top-0 -translate-y-1/2 text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs">
            Password
          </label>
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition">
            {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </button>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-sky-600 dark:accent-sky-400" />
            Remember me
          </label>
          <button type="button" className="text-sky-600 dark:text-sky-400 hover:underline" onClick={() => setRoute && setRoute("ForgetPassword")}>
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={!isFormValid} className={`w-full h-12 rounded-xl font-semibold text-white transition ${isFormValid ? "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600" : "bg-sky-300 cursor-not-allowed"}`}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="flex items-center my-4">
          <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="mx-3 text-sm text-gray-500 dark:text-gray-400">OR</span>
          <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => openOAuthPopup(`${API_URL}/auth/oauth/google`)} className="flex items-center justify-center gap-2 py-3 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Continue with Google">
            <FcGoogle size={20} />
            <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">Google</span>
          </button>

          <button type="button" onClick={() => openOAuthPopup(`${API_URL}/auth/oauth/github`)} className="flex items-center justify-center gap-2 py-3 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Continue with GitHub">
            <AiFillGithub size={20} className="text-gray-800 dark:text-gray-200" />
            <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">GitHub</span>
          </button>
        </div>

        <div className="text-center mt-5 text-sm text-gray-700 dark:text-gray-300">
          Don’t have an account?{" "}
          <button type="button" className="text-sky-600 dark:text-sky-400 hover:underline" onClick={() => setRoute && setRoute("Sign-Up")}>
            Create one
          </button>
        </div>
      </form>
    </div>
  );
}
