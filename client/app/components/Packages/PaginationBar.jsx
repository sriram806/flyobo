"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationBar({ currentPage, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
      <button
        disabled={currentPage <= 1}
        onClick={onPrev}
        className={`inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500/60 ${
          currentPage <= 1 
            ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500" 
            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      
      <div className="flex items-center gap-2">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => {
                // In a real app, you would need to update the page state
                // For now, we'll just scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition ${
                currentPage === page
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button
        disabled={currentPage >= totalPages}
        onClick={onNext}
        className={`inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500/60 ${
          currentPage >= totalPages 
            ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500" 
            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}