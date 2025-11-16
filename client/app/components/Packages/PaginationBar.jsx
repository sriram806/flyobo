"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function PaginationBar({ currentPage, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-6">
      <button
        disabled={currentPage <= 1}
        onClick={onPrev}
        className={`inline-flex text-gray-800 dark:text-gray-100 items-center gap-1 rounded border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500/60 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          currentPage <= 1 ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <FiChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <div className="px-4 py-2  rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200">
        Page {currentPage} of {totalPages}
      </div>
      <button
        disabled={currentPage >= totalPages}
        onClick={onNext}
        className={`inline-flex text-gray-800 dark:text-gray-100 items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500/60 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          currentPage >= totalPages ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        Next
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
