"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

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
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Subscription failed");
      }
      setEmail("");
      setStatus({ type: "success", message: "Subscribed! Please check your inbox." });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || "Something went wrong." });
    }
  };

  return (
    <section className="bg-[#0b1220] py-12 sm:py-16 mt-0">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Subscribe to Our Newsletter</h2>
          <p className="mt-2 text-gray-300">Stay updated with our latest travel deals, new destinations, and travel tips.</p>
        </div>
        <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-md border border-gray-700 bg-[#121a2b] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-600"
            aria-label="Email address"
            required
          />
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="px-5 py-3 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-70 text-white font-medium transition-colors"
          >
            {status.type === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-gray-400">We respect your privacy. Unsubscribe at any time.</p>
        {status.message && (
          <div className={`mt-3 text-center text-sm ${status.type === "error" ? "text-rose-400" : "text-emerald-400"}`}>
            {status.message}
          </div>
        )}
      </div>
    </section>
  );
}
