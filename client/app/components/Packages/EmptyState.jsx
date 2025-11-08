"use client";

import { SearchX, RotateCcw } from "lucide-react";

export default function EmptyState({ title = "No results", message = "Try adjusting your filters or search.", onReset }) {
  return (
    <div className="mt-8 text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">{message}</p>
      {onReset && (
        <button 
          onClick={onReset} 
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </button>
      )}
    </div>
  );
}