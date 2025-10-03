"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub } from "react-icons/ai";
import { styles } from "../../../components/styles/style";
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import ModalHeader from "../components/ModalHeader";
import { HiOutlineUser } from "react-icons/hi";


const SignUp = ({ setOpen, setRoute }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "", terms: "" });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const validate = () => {
    const next = { name: "", email: "", password: "", terms: "" };
    let valid = true;

    if (!formData.name.trim()) {
      next.name = "Name is required";
      valid = false;
    } else if (formData.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      next.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      next.email = "Enter a valid email address";
      valid = false;
    }

    if (!formData.password) {
      next.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      next.password = "Password must be at least 6 characters";
      valid = false;
    }

    // confirm password removed

    if (!acceptTerms) {
      next.terms = "You must accept the Terms to continue";
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      !!formData.email &&
      formData.password.length >= 6 &&
      acceptTerms &&
      !loading
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error("Please fix the errors and try again."); return; }
    try {
      setLoading(true);
      const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!API_URL) {
        toast.error("API base URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in .env.local and restart the dev server.");
        throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
      }
      const base = API_URL.replace(/\/$/, "");
      const endpoint = `${base}/auth/register`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let serverMsg = data?.message || data?.error || "Registration failed";
        if (res.status === 404) {
          serverMsg = `Endpoint not found (404): ${endpoint}`;
        }
        if (/email/i.test(serverMsg)) {
          setErrors((prev) => ({ ...prev, email: serverMsg }));
        } else if (/password/i.test(serverMsg)) {
          setErrors((prev) => ({ ...prev, password: serverMsg }));
        }
        toast.error(serverMsg);
        throw new Error(serverMsg);
      }

      const user = data?.user || data?.data?.user || null;
      if (user) {
        dispatch(setAuthUser(user));
      }
      toast.success("Registration successful. Check your email for the OTP code.");
      if (setRoute) setRoute("Verification");
    } catch (err) {
      console.error(err);
      if (!err?.message) toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="w-full">
      <ModalHeader
        icon={<HiOutlineUser size={24} />}
        title="Create your account"
        description="Join Flyobo and start your journey."
        gradientClass="from-emerald-600 to-teal-500"
        shadowClass="shadow-emerald-600/20"
      />
      <form onSubmit={handleSubmit} className="mt-6">
        {/* Name */}
        <div className="relative">
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-black dark:text-white outline-none transition 
            ${errors.name ? "border-red-500" : "border-gray-400 dark:border-gray-600"} 
            focus:border-gray-800 dark:focus:border-gray-200`}
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
            autoComplete="name"
          />
          <label
            htmlFor="name"
            className="pointer-events-none absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                       top-0 -translate-y-1/2 text-xs
                       peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                       peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
          >
            Your Name
          </label>
        </div>
        {errors.name && <p id="name-error" className={`${styles.errorText}`}>{errors.name}</p>}

        {/* Email */}
        <div className="mt-4">
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-black dark:text-white outline-none transition 
              ${errors.email ? "border-red-500" : "border-gray-400 dark:border-gray-600"} 
              focus:border-gray-800 dark:focus:border-gray-200`}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              autoComplete="email"
            />
            <label
              htmlFor="email"
              className="pointer-events-none absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                         top-0 -translate-y-1/2 text-xs
                         peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                         peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
            >
              Email
            </label>
          </div>
          {errors.email && <p id="email-error" className={`${styles.errorText}`}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mt-4">
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? (
                <AiOutlineEye size={22} className="text-gray-700 dark:text-gray-200" />
              ) : (
                <AiOutlineEyeInvisible size={22} className="text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
          {errors.password && <p id="password-error" className={`${styles.errorText}`}>{errors.password}</p>}
        </div>

        {/* Confirm Password removed */}

        {/* Terms */}
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            I agree to the <button type="button" className={`${styles.link}`}>Terms</button> and <button type="button" className={`${styles.link}`}>Privacy Policy</button>
          </label>
          {errors.terms && <p className={`${styles.errorText}`}>{errors.terms}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid()}
          aria-busy={loading}
          aria-disabled={!isFormValid()}
          className={`mt-5 ${styles.button} ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {/* Divider */}
        <div className={`${styles.divider}`}>
          <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
          <span className="text-sm text-gray-500">OR</span>
          <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Social Sign Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" className={`${styles.socialButton}`} aria-label="Continue with Google">
            <FcGoogle size={20} />
          </button>
          <button type="button" className={`${styles.socialButton}`} aria-label="Continue with GitHub">
            <AiFillGithub size={20} />
          </button>
        </div>

        {/* Switch to Login */}
        <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Already have an account? {" "}
          <button type="button" className={`${styles.link}`} onClick={() => setRoute && setRoute("Login")}>
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;