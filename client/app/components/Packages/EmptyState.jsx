"use client";

export default function EmptyState({ title = "No results", message = "Try adjusting your filters or search.", onReset }) {
  return (
    <div className="mt-8 text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-3 text-base font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
      {onReset && (
        <button onClick={onReset} className="mt-4 inline-flex items-center rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700">
          Reset Filters
        </button>
      )}
    </div>
  );
}
