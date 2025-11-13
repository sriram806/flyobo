"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { styles } from "../../../components/styles/style";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import { HiOutlineKey } from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ModalHeader from "../components/ModalHeader";

const OTP_LENGTH = 4;

const ResetPassword = ({ setRoute, setOpen }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({ email: "", otp: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef([]);
  const code = useMemo(() => values.join(""), [values]);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining

  // Prefill email from sessionStorage if available
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('resetEmail');
        if (saved) setEmail(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Focus first empty input on mount
    const idx = values.findIndex((v) => v === "");
    const focusIndex = idx === -1 ? 0 : idx;
    inputsRef.current[focusIndex]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOtpChange = (index, raw) => {
    setErrors((e) => ({ ...e, otp: "" }));
    const value = raw.replace(/\D/g, "").slice(0, 1);
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (values[index]) {
        setValues((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setValues((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    const digits = text.slice(0, OTP_LENGTH).split("");
    setValues((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) next[i] = digits[i] || "";
      return next;
    });
    const lastIndex = Math.min(digits.length, OTP_LENGTH) - 1;
    inputsRef.current[lastIndex >= 0 ? lastIndex : 0]?.focus();
  };

  // Cooldown countdown for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const validate = () => {
    const next = { email: "", otp: "", password: "", confirmPassword: "" };
    let ok = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      next.email = "Enter a valid email address.";
      ok = false;
    }
    if (code.length !== OTP_LENGTH || values.some((v) => v === "")) {
      next.otp = "Enter the 4-digit code from your email.";
      ok = false;
    }
    if (!password || password.length < 6) {
      next.password = "Password must be at least 6 characters.";
      ok = false;
    }
    if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
      ok = false;
    }
    setErrors(next);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors and try again.");
      return;
    }
    try {
      setLoading(true);
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!API_URL) {
        toast.error("API base URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in .env.local.");
        throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
      }
      const base = API_URL.replace(/\/$/, "");
      const endpoint = `${base}/auth/reset-password`;

      const { data } = await axios.post(
        endpoint,
        { email, otp: code, password },
        { withCredentials: true }
      );

      toast.success(data?.message || "Password reset successfully. Please sign in.");
      if (setRoute) setRoute("Login");
      if (setOpen) setOpen(false);
      try { if (typeof window !== 'undefined') sessionStorage.removeItem('resetEmail'); } catch {}
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => email && code.length === OTP_LENGTH && values.every((v) => v !== "") && password.length >= 6 && confirmPassword === password && !loading;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg transition-all duration-300">
      <ModalHeader
        icon={<HiOutlineKey size={28} />}
        title="Reset your password"
        description="Enter the 4-digit code we sent to your email and choose a new password."
        gradientClass="from-blue-600 to-cyan-500"
        shadowClass="shadow-blue-600/20"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label hidden className={`${styles.label} !text-left block`} htmlFor="email">Email address</label>
          <input
            hidden
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourmail@gmail.com"
            className={`${styles.input} ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700"} text-center`}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
            autoComplete="email"
          />
          {errors.email && <p id="email-error" className={`${styles.errorText} text-center`}>{errors.email}</p>}
        </div>

        <div>
          <label className={`${styles.label} !text-left block`} htmlFor="otp-0">4-digit code</label>
          <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={values[i]}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                ref={(el) => (inputsRef.current[i] = el)}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-lg sm:text-xl font-semibold tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
          {errors.otp && <p id="otp-error" className={`${styles.errorText} text-center mt-3`}>{errors.otp}</p>}
        </div>

        <div>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`peer w-full bg-transparent border-2 rounded-xl h-14 pr-12 px-3 pt-5 pb-2 text-black dark:text-white outline-none transition 
              ${errors.password ? "border-red-500" : "border-gray-400 dark:border-gray-600"} 
              focus:border-gray-800 dark:focus:border-gray-200`}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              autoComplete="new-password"
            />
            <label
              htmlFor="password"
              className="pointer-events-none absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                         top-0 -translate-y-1/2 text-xs
                         peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                         peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
            >
              New password
            </label>
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? (
                <AiOutlineEyeInvisible size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <AiOutlineEye size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
          {errors.password && <p id="password-error" className={`${styles.errorText}`}>{errors.password}</p>}
        </div>

        <div>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`peer w-full bg-transparent border-2 rounded-xl h-14 pr-12 px-3 pt-5 pb-2 text-black dark:text-white outline-none transition 
              ${errors.confirmPassword ? "border-red-500" : "border-gray-400 dark:border-gray-600"} 
              focus:border-gray-800 dark:focus:border-gray-200`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby="confirmPassword-error"
              autoComplete="new-password"
            />
            <label
              htmlFor="confirmPassword"
              className="pointer-events-none absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                         top-0 -translate-y-1/2 text-xs
                         peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                         peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
            >
              Confirm new password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <AiOutlineEye size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p id="confirmPassword-error" className={`${styles.errorText}`}>{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={!isFormValid()}
          aria-busy={loading}
          aria-disabled={!isFormValid()}
          className={`mt-2 w-full ${styles.button} ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Updating..." : "Reset password"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
        Already reset? {" "}
        <button type="button" className={`${styles.link}`} onClick={() => setRoute && setRoute("Login") }>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;