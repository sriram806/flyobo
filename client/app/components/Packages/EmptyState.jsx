"use client";

import { SearchX, RotateCcw } from "lucide-react";

export default function EmptyState({
  title = "No results found",
  message = "Try adjusting your filters or search terms.",
  onReset,
}) {
  return (
    <div className="mt-10 text-center py-16 border-2 border-dashed rounded-2xl
      border-gray-300 dark:border-gray-800
      bg-gradient-to-br from-gray-50 via-white to-indigo-50
      dark:from-[#0a0a0a] dark:via-gray-900 dark:to-indigo-950
      shadow-inner shadow-gray-200/40 dark:shadow-gray-900/40 transition-all duration-500"
    >
      {/* Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full 
        bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700
        shadow-sm backdrop-blur-sm"
      >
        <SearchX className="h-9 w-9 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="mt-5 text-2xl font-extrabold 
        text-gray-900 dark:text-gray-50 tracking-tight"
      >
        {title}
      </h3>

      {/* Message */}
      <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
        {message}
      </p>

      {/* Reset Button */}
      {onReset && (
        <button
          onClick={onReset}
          className="mt-7 inline-flex items-center gap-2 rounded-xl 
          bg-gradient-to-r from-sky-600 to-indigo-600 
          hover:from-sky-700 hover:to-indigo-700 
          text-white px-6 py-3 text-sm font-semibold 
          shadow-md shadow-sky-500/30 dark:shadow-indigo-900/40 
          transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </button>
      )}
    </div>
  );
}
