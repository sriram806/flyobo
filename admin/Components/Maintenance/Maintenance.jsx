"use client";

import React from "react";
import { FaTools } from "react-icons/fa";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-black p-6 relative overflow-hidden">

      {/* Floating Circles Background */}
      <div className="absolute w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
      <div className="absolute w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl -bottom-24 -right-10 animate-pulse" />

      {/* Glass Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 p-12 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 max-w-xl text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/20 dark:bg-blue-500/20 p-6 rounded-full shadow-lg backdrop-blur-md">
            <FaTools className="text-5xl text-blue-600 dark:text-blue-400 animate-spin-slow" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
          Under Maintenance
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
          We are upgrading our systems to serve you better.  
          Thank you for your patience while we perform scheduled maintenance.
        </p>

        {/* Button */}
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95"
        >
          Refresh
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center text-gray-600 dark:text-gray-400 text-sm w-full">
        <p>
          © 2025 <span className="font-semibold text-blue-700 dark:text-blue-400">Flyobo (Swagatam World LLP)</span>.  
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}
