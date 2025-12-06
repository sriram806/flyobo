"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { HiOutlineShieldCheck } from "react-icons/hi";
import axios from "axios";
import ModalHeader from "../components/ModalHeader";
import { styles } from "@/Components/styles/style";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";

const OTP_LENGTH = 4;

const Verification = ({ setOpen, setRoute }) => {
  const [values, setValues] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef([]);

  const code = useMemo(() => values.join(""), [values]);
  const isComplete = code.length === OTP_LENGTH && values.every((v) => v !== "");

  useEffect(() => {
    const idx = values.findIndex((v) => v === "");
    const focusIndex = idx === -1 ? 0 : idx;
    inputsRef.current[focusIndex]?.focus();
  }, []);

  const handleChange = (index, raw) => {
    setError("");
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

  const handleKeyDown = (index, e) => {
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
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    const digits = text.slice(0, OTP_LENGTH).split("");
    setValues((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i++) {
        next[i] = digits[i] || "";
      }
      return next;
    });
    const lastIndex = Math.min(digits.length, OTP_LENGTH) - 1;
    inputsRef.current[lastIndex >= 0 ? lastIndex : 0]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isComplete) {
      setError("Please enter the 4-digit code.");
      toast.error("Please enter the 4-digit code.");
      return;
    }
    try {
      setLoading(true);
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL 
      if (!API_URL) {
        toast.error("API base URL not configured");
        throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
      }
      const endpoint = `${API_URL}/auth/verify-otp`;
      const { data } = await axios.post(endpoint, { otp: code }, { withCredentials: true, timeout: 15000 });
      if (data?.message) toast.success(data.message);
      if (setOpen) setOpen(false);
      if (setRoute) setRoute("Login");
      if (!data?.message) toast.success("Verification successful. You can now sign in.");
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || "Invalid or expired code. Please try again.";
      setError(serverMsg);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
      if (!API_URL) {
        toast.error("API base URL not configured");
        throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
      }
      const endpoint = `${API_URL}/auth/resend-otp`;
      const { data } = await axios.post(endpoint, {}, { withCredentials: true, timeout: 15000 });
      toast.success(data?.message || "A new code has been sent to your email.");
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            clearInterval(interval);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || "Failed to resend code. Please try again later.";
      setError(serverMsg);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg transition-all duration-300">
      <ModalHeader
        icon={<HiOutlineShieldCheck size={24} />}
        title="Enter verification code"
        description="We’ve sent a 4-digit code to your email. Please enter it below to continue."
        gradientClass="from-sky-600 to-blue-500"
        shadowClass="shadow-sky-600/20"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={values[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              ref={(el) => (inputsRef.current[i] = el)}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-lg sm:text-xl md:text-2xl font-semibold tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow md:hover:shadow-md"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && <p className={styles.errorText} aria-live="assertive">{error}</p>}

        <button type="submit" disabled={!isComplete || loading} className={`mt-6 w-full ${styles.button}`}>
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Didn’t receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className={`${styles.link} ${resendCooldown ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={loading || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Verification;
