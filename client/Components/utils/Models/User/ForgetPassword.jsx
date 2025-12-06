"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { HiOutlineLockClosed } from "react-icons/hi";
import ModalHeader from "../components/ModalHeader";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";
import { styles } from "@/Components/styles/style";

export default function ForgetPassword({ setRoute, setOpen }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please enter a valid email");
      return;
    }
    try {
      setLoading(true);
      const API = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
      if (!API) {
        toast.error("API base URL not configured");
        return;
      }
      const endpoint = `${API}/auth/forgot-password`;
      const { data } = await axios.post(endpoint, { email }, { withCredentials: true, timeout: 15000 });
      toast.success(data?.message || "If an account exists, a 4-digit code was sent to your email.");
      try { sessionStorage.setItem("resetEmail", email); } catch {}
      setRoute && setRoute("ResetPassword");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send reset link.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => email.length > 0 && !loading;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg transition-all duration-300">
      <ModalHeader
        icon={<HiOutlineLockClosed size={28} />}
        title="Reset your password"
        description="Enter the email associated with your account and we will send you a link to reset your password."
        gradientClass="from-rose-500 to-pink-500"
        shadowClass="shadow-rose-500/20"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="relative">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-black dark:text-white outline-none transition 
              ${error ? "border-red-500" : "border-gray-400 dark:border-gray-600"} 
              focus:border-gray-800 dark:focus:border-gray-200`}
            aria-invalid={!!error}
            aria-describedby="email-error"
            autoComplete="email"
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all top-0 -translate-y-1/2 text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs"
          >
            Email
          </label>
        </div>

        {error && <p id="email-error" className={`${styles.errorText}`}>{error}</p>}

        <button
          type="submit"
          disabled={!isFormValid()}
          aria-busy={loading}
          aria-disabled={!isFormValid()}
          className={`mt-6 w-full ${styles.button} ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
        Remembered your password?{" "}
        <button type="button" className={`${styles.link}`} onClick={() => setRoute && setRoute("Login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
}
