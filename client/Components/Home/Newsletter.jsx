"use client";

import { useState, useEffect } from "react";
import { FiMail } from "react-icons/fi";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    try {
      setStatus({ type: "loading", message: "" });
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      if (!res.ok) throw new Error("Subscription failed, try again.");

      setEmail("");
      setStatus({ type: "success", message: "Subscribed! Please check your inbox." });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || "Something went wrong." });
    }
  };

  const title = "Join our Newsletter";
  const description = "Subscribe and never miss our travel updates.";
  const placeholder = "Enter your email address";
  const buttonText = "Subscribe";
  const privacy = "We never share your email. Unsubscribe anytime.";

  return (
    <section className="py-14 bg-gray-300/50 dark:bg-gray-800/50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading (simple fade & slide up on mount) */}
        <div
          className={`text-center transform transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className={`mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto transform transition-all duration-500 delay-75 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
        >
          <div className="relative flex-1 w-full">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="email"
              value={email}
              placeholder={placeholder}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full pl-10 pr-4 py-3 rounded-md border 
                border-gray-300 dark:border-gray-700
                bg-white dark:bg-[#121a2b]
                text-gray-900 dark:text-gray-100
                placeholder-gray-400
                outline-none focus:ring-2 focus:ring-sky-600
              "
              required
              aria-label="Email address"
            />
          </div>

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="
              w-full sm:w-auto px-6 py-3 rounded-md
              bg-sky-600 hover:bg-sky-700 disabled:opacity-60
              text-white font-medium transition-colors
            "
          >
            {status.type === "loading" ? "Subscribing..." : buttonText}
          </button>
        </form>

        {/* Status Message */}
        {status.message && (
          <p
            className={`mt-3 text-center text-sm ${status.type === "error"
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
              }`}
            role={status.type === "error" ? "alert" : "status"}
          >
            {status.message}
          </p>
        )}

        {/* Privacy Note */}
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          {privacy}
        </p>
      </div>
    </section>
  );
}
