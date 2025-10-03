"use client";

export default function ResultsToolbar({ filteredCount, sortBy, setSortBy, view, setView }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> Packages Found
        <span className="ml-2 text-xs">Showing filtered results</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-900 px-2 py-1.5"
          >
            <option value="popular">Recommended</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("grid")}
            className={`rounded-md px-2 py-1 border text-xs ${view === 'grid' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'}`}
            aria-label="Grid view"
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-md px-2 py-1 border text-xs ${view === 'list' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'}`}
            aria-label="List view"
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
}
