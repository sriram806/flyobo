"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";
import ReferralInput from "@/Components/Auth/ReferralInput";
import Header from "@/Components/Layout/Header";
import Footer from "@/Components/Layout/Footer";
import Heading from "@/Components/MetaData/Heading";

export default function RegistrationPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [route, setRoute] = useState("");

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

    const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleChange = (e) =>
        setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

    const validateForm = () => {
        const newErrors = {};

        if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!acceptTerms) {
            newErrors.terms = "You must accept the Terms & Privacy Policy";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length) {
            toast.error(Object.values(newErrors)[0]);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!API_URL) {
            toast.error("Backend URL not configured");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                `${API_URL}/auth/register`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                    timeout: 15000,
                }
            );

            if (res.data?.success === false) {
                throw new Error(res.data?.message || "Registration failed");
            }

            if (res.data?.user) {
                dispatch(setAuthUser(res.data.user));
                toast.success("Welcome aboard! Your account is ready.");

                if (res.data.user.role === "manager") {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
            } else {
                toast.success("Account created. Please verify your email.");
                setRoute("Verification");
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "Something went wrong";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Heading title={"Referral | Flyobo"} description={""} keywords={``} />
            <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-10">
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left travel promo side */}
                    <div className="hidden md:flex flex-col gap-5 text-slate-900 dark:text-slate-100">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 w-fit">
                            ✈️ Flyobo • Your smart travel partner
                        </span>
                        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                            Create your{" "}
                            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                                travel account
                            </span>{" "}
                            and explore the world.
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Manage trips, track bookings, earn rewards from referrals, and get
                            the best deals curated just for you.
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-lg px-4 py-3">
                                <p className="font-semibold">Instant Bookings</p>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Real-time confirmations for flights and holidays.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-lg px-4 py-3">
                                <p className="font-semibold">Referral Rewards</p>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Invite friends and earn travel credits on every booking.
                                </p>
                            </div>
                        </div>
                        <ReferralInput
                            onReferralChange={(val) =>
                                setFormData((s) => ({ ...s, referralCode: val }))
                            }
                        />
                    </div>

                    {/* Right auth card */}
                    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-sky-100/70 dark:border-slate-800">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                Join Flyobo
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Sign up to start planning your next adventure.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition ${errors.name
                                        ? "border-red-500"
                                        : "border-slate-200 dark:border-slate-700"
                                        } focus:border-sky-500 dark:focus:border-sky-400`}
                                    required
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-xs text-slate-500 dark:text-slate-400 transition-all top-0 -translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs"
                                >
                                    Full Name
                                </label>
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    className={`peer w-full bg-transparent border-2 rounded-xl h-14 px-3 pt-5 pb-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition ${errors.email
                                        ? "border-red-500"
                                        : "border-slate-200 dark:border-slate-700"
                                        } focus:border-sky-500 dark:focus:border-sky-400`}
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-xs text-slate-500 dark:text-slate-400 transition-all top-0 -translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs"
                                >
                                    Email address
                                </label>
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className={`peer w-full bg-transparent border-2 rounded-xl h-14 pr-11 px-3 pt-5 pb-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition ${errors.password
                                        ? "border-red-500"
                                        : "border-slate-200 dark:border-slate-700"
                                        } focus:border-sky-500 dark:focus:border-sky-400`}
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-3 bg-white dark:bg-slate-900 px-1 text-xs text-slate-500 dark:text-slate-400 transition-all top-0 -translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition"
                                >
                                    {showPwd ? (
                                        <AiOutlineEyeInvisible size={18} />
                                    ) : (
                                        <AiOutlineEye size={18} />
                                    )}
                                </button>

                                {errors.password && (
                                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>


                            {/* Terms */}
                            <div className="mt-1">
                                <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span>
                                        I agree to the{" "}
                                        <button
                                            type="button"
                                            className="text-sky-600 hover:underline"
                                        >
                                            Terms of Service
                                        </button>{" "}
                                        and{" "}
                                        <button
                                            type="button"
                                            className="text-sky-600 hover:underline"
                                        >
                                            Privacy Policy
                                        </button>
                                        .
                                    </span>
                                </label>
                                {errors.terms && (
                                    <p className="text-xs text-red-500 mt-1">{errors.terms}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-semibold tracking-wide shadow-md shadow-sky-500/30 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                            >
                                {loading ? "Creating your travel account..." : "Create account"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
