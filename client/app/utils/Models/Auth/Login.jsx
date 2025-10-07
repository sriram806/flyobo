"use client";

import { useState } from "react";
import { toast } from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillGithub } from "react-icons/ai"
import { FcGoogle } from "react-icons/fc"
import { styles } from "../../../components/styles/style";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import ModalHeader from "../components/ModalHeader";
import { HiOutlineLockClosed } from "react-icons/hi";

const Login = ({ setRoute, setOpen }) => {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrors({ email: "", password: "" });
            
            const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
            if (!API_URL) {
                toast.error("API base URL is not configured. Set NEXT_PUBLIC_BACKEND_URL in .env.local and restart the dev server.");
                throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
            }
            const base = API_URL.replace(/\/$/, "");
            const endpoint = `${base}/auth/login`;

            const { data } = await axios.post(
                endpoint,
                { email, password, remember },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Store token if provided (fallback method)
            const token = data?.token;
            if (token) {
                try {
                    localStorage.setItem('auth_token', token);
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                } catch (tokenError) {
                    console.warn('Failed to store token:', tokenError);
                }
            }

            // Get user data from response
            const user = data?.user || data?.data?.user;
            if (!user) {
                throw new Error("User data not received from server");
            }

            // Update Redux store
            dispatch(setAuthUser(user));
            
            // Close modal
            if (setOpen) {
                setOpen(false);
            }
            
            toast.success(data?.message || "Signed in successfully.");
        } catch (err) {
            console.error('Login error:', err);
            
            // Handle specific error cases
            const serverMessage = err?.response?.data?.message;
            if (err?.response?.status === 401) {
                if (serverMessage?.toLowerCase().includes('email') || serverMessage?.toLowerCase().includes('user')) {
                    setErrors(prev => ({ ...prev, email: serverMessage }));
                } else if (serverMessage?.toLowerCase().includes('password')) {
                    setErrors(prev => ({ ...prev, password: serverMessage }));
                }
            }
            
            const msg = serverMessage || err?.message || "Failed to sign in. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return email.length > 0 && password.length >= 6 && !loading;
    };

    return (
        <div className="w-full">
            <ModalHeader
                icon={<HiOutlineLockClosed size={24} />}
                title="Sign in to Flyobo"
                description="Welcome back! Please enter your details."
                gradientClass="from-indigo-600 to-blue-600"
                shadowClass="shadow-indigo-600/20"
            />
            <form onSubmit={handleSubmit} className="mt-6">
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                {errors.email && (
                    <p id="email-error" className={`${styles.errorText}`}>
                        {errors.email}
                    </p>
                )}

                <div className="mt-7">
                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className={`peer w-full bg-transparent border-2 rounded-xl h-14 pr-12 px-3 pt-5 pb-2 text-black dark:text-white outline-none transition 
                            ${errors.password ? "border-red-500" : "border-gray-400 dark:border-gray-600"} 
                            focus:border-gray-800 dark:focus:border-gray-200`}
                            aria-invalid={!!errors.password}
                            aria-describedby="password-error"
                            autoComplete="current-password"
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
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded"
                            aria-label={show ? "Hide password" : "Show password"}
                        >
                            {show ? (
                                <AiOutlineEyeInvisible size={20} className="text-gray-600 dark:text-gray-300" />
                            ) : (
                                <AiOutlineEye size={20} className="text-gray-600 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p id="password-error" className={`${styles.errorText}`}>
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        Remember me
                    </label>
                    <button type="button" className={`${styles.link}`} onClick={() => setRoute && setRoute("ForgetPassword")}>
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid()}
                    aria-busy={loading}
                    aria-disabled={!isFormValid()}
                    className={`mt-14 ${styles.button} ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className={`${styles.divider}`}>
                    <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
                    <span className="text-sm text-gray-500">OR</span>
                    <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        className={`${styles.socialButton}`}
                        aria-label="Continue with Google"
                    >
                        <FcGoogle size={20} />
                    </button>
                    <button
                        type="button"
                        className={`${styles.socialButton}`}
                        aria-label="Continue with GitHub"
                    >
                        <AiFillGithub size={20} />
                    </button>
                </div>
                <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
                    Don't have an account? {" "}
                    <button type="button" className={`${styles.link}`} onClick={() => setRoute && setRoute("Sign-Up")}>
                        Create one
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login