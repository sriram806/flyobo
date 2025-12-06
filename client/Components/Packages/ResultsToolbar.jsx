"use client";

import { Grid, List, ChevronDown } from "lucide-react";

export default function ResultsToolbar({ filteredCount = 0, sortBy, setSortBy, view, setView }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-5 py-4 shadow-sm transition-all duration-300">
      <div className="text-sm">
        <span className="font-bold text-gray-900 dark:text-white text-lg">{filteredCount}</span>{" "}
        <span className="text-gray-700 dark:text-gray-300">Packages Found</span>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showing filtered results</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/60 pr-10 text-gray-800 dark:text-gray-200 transition-all duration-200"
            >
              <option value="popular">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner transition-all">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              view === "grid"
                ? "bg-white dark:bg-gray-700 text-sky-600 dark:text-sky-400 shadow"
                : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
            aria-label="Grid view"
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              view === "list"
                ? "bg-white dark:bg-gray-700 text-sky-600 dark:text-sky-400 shadow"
                : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
