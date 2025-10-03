"use client";

import { FiSearch, FiDollarSign, FiStar, FiClock, FiGrid, FiRefreshCw, FiChevronDown } from "react-icons/fi";

export default function FiltersPanel({ search, setSearch, minPrice, maxPrice, setMaxPrice, minRating, setMinRating, minDays, maxDays, setMinDays, setMaxDays, onReset, }) {
  return (
    <aside className="lg:col-span-1">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiGrid className="text-sky-500" /> Refine Your Search
          </div>
          <button
            onClick={onReset}
            className="text-xs sm:text-sm inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          >
            <FiRefreshCw className="h-4 w-4" /> Reset
          </button>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <FiSearch className="text-sky-500" /> Search Packages
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          />
        </div>
        <div>
          <div className="text-sm pt-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <FiDollarSign className="text-green-500" /> Price Range
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            ₹{minPrice.toLocaleString("en-IN")} — ₹{maxPrice.toLocaleString("en-IN")}
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-3 w-full accent-sky-600"
          />
        </div>
        <div>
          <div className="text-sm pt-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <FiStar className="text-yellow-500" /> Rating
          </div>
          <div className="relative mt-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="appearance-none w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            >
              <option value={0}>Any</option>
              <option value={3}>3+ stars</option>
              <option value={4}>4+ stars</option>
              <option value={4.5}>4.5+ stars</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div>
          <div className="text-sm pt-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <FiClock className="text-purple-500" /> Duration (days)
          </div>
          <div className="relative mt-2">
            <select
              className="appearance-none w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              value={`${minDays}-${maxDays}`}
              onChange={(e) => {
                const [a, b] = e.target.value.split("-").map(Number);
                setMinDays(a);
                setMaxDays(b);
              }}
            >
              <option value={`1-30`}>Any duration</option>
              <option value={`1-3`}>1-3 days</option>
              <option value={`4-6`}>4-6 days</option>
              <option value={`7-10`}>7-10 days</option>
              <option value={`11-30`}>10+ days</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}
