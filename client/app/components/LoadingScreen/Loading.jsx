"use client";

import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-gradient-to-br from-rose-500/15 via-fuchsia-500/10 to-blue-500/15 dark:from-rose-400/10 dark:via-fuchsia-400/10 dark:to-blue-400/10">

      {/* Loader card (colorful modal style) */}
      <div className="relative w-full max-w-sm rounded-2xl border border-rose-200/40 dark:border-rose-300/20 bg-white/95 dark:bg-gray-900/95 shadow-2xl p-6 text-center">
        {/* Rotating compass icon */}
        <div className="relative mx-auto mb-5 h-14 w-14">
          <svg
            className="h-14 w-14 text-rose-600 dark:text-rose-400 animate-spin-slow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" className="opacity-40" />
            <path d="M12 5l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="currentColor" className="opacity-90" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-lg font-semibold text-gray-900 dark:text-white">Preparing your journey…</div>
        <div className="mt-1 text-sm text-gray-700/90 dark:text-gray-300">We’re loading the best travel experiences for you.</div>

        {/* Progress stripe */}
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-blue-500 animate-progress" />
        </div>

        {/* Subtext */}
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">Tip: Press Ctrl+K to search destinations.</div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(40%); }
          100% { transform: translateX(120%); }
        }
        .animate-progress { animation: progress 1.2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Loading;