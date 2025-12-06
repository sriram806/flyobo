"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function PaginationBar({ currentPage, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        aria-label="Previous page"
        disabled={currentPage <= 1}
        onClick={onPrev}
        className={`inline-flex items-center gap-2 rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 transition focus:outline-none focus:ring-2 focus:ring-sky-500/60 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          currentPage <= 1 ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <FiChevronLeft className="h-4 w-4" />
        <span className="hidden md:inline">Previous</span>
      </button>

      <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200">
        <span className="hidden md:inline">Page {currentPage} of {totalPages}</span>
        <span className="md:hidden">{currentPage}/{totalPages}</span>
      </div>

      <button
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        onClick={onNext}
        className={`inline-flex items-center gap-2 rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 transition focus:outline-none focus:ring-2 focus:ring-sky-500/60 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          currentPage >= totalPages ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className="hidden md:inline">Next</span>
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
