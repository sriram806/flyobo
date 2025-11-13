"use client";

import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub } from "react-icons/ai";
import { HiOutlineUser } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import ReferralInput from "../../../components/Auth/ReferralInput";
import ModalHeader from "../components/ModalHeader";

export default function SignUp({ setOpen, setRoute }) {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (step === 3 && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (step === 3 && !acceptTerms) {
      newErrors.terms = "You must accept the Terms & Privacy Policy";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setLoading(true);
      const API_URL =
        NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Registration failed");

      dispatch(setAuthUser(data.user));
      toast.success("Account created successfully!");
      setRoute("Verification");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg transition-all duration-300">
      <ModalHeader
        icon={<HiOutlineUser size={24} />}
        title="Create Account"
        description="Join Flyobo in a few simple steps"
        gradientClass="from-sky-600 to-blue-500"
        shadowClass="shadow-sky-600/20"
      />

      {/* Step Indicator */}
      <div className="flex justify-center gap-2 mt-5">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 w-8 rounded-full transition-all ${
              step >= n ? "bg-sky-500" : "bg-gray-300 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* STEP 1 - Name + Referral */}
        {step === 1 && (
          <>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none transition
                ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                }
                focus:border-sky-500 dark:focus:border-sky-400`}
                required
              />
              <label
                htmlFor="name"
                className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                  top-0 -translate-y-1/2 text-xs
                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                  peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
              >
                Name
              </label>
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <ReferralInput
              onReferralChange={(val) =>
                setFormData({ ...formData, referralCode: val })
              }
            />
          </>
        )}

        {/* STEP 2 - Email */}
        {step === 2 && (
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none transition
                ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                }
                focus:border-sky-500 dark:focus:border-sky-400`}
              required
            />
            <label
              htmlFor="email"
              className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                top-0 -translate-y-1/2 text-xs
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
            >
              Email
            </label>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        )}

        {/* STEP 3 - Password */}
        {step === 3 && (
          <>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`peer w-full bg-transparent border-2 rounded-xl h-14 pr-12 px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none transition
                  ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }
                  focus:border-sky-500 dark:focus:border-sky-400`}
                required
              />
              <label
                htmlFor="password"
                className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-gray-500 dark:text-gray-400 transition-all
                  top-0 -translate-y-1/2 text-xs
                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                  peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition"
              >
                {showPwd ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-sky-600 border-gray-300 rounded"
              />
              I agree to{" "}
              <button type="button" className="text-sky-600 hover:underline">
                Terms
              </button>{" "}
              and{" "}
              <button type="button" className="text-sky-600 hover:underline">
                Privacy Policy
              </button>
            </label>
            {errors.terms && (
              <p className="text-sm text-red-500 mt-1">{errors.terms}</p>
            )}
          </>
        )}

        {/* Step Controls */}
        <div className="flex justify-between items-center mt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="text-gray-600 dark:text-gray-400 hover:text-sky-600 text-sm font-medium"
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium transition ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-medium transition ml-auto disabled:opacity-50"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          )}
        </div>
      </form>

      {/* Social login */}
      <div className="flex items-center gap-3 mt-8">
        <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
        <span className="text-sm text-gray-500">OR</span>
        <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <FcGoogle size={20} /> Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <AiFillGithub size={20} /> GitHub
        </button>
      </div>

      {/* Already have account */}
      <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setRoute("Login")}
          className="text-sky-600 hover:underline"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
