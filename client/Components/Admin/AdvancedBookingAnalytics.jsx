"use client";

import React from "react";

export default function AdvancedBookingAnalytics() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Booking Analytics</h3>
        <div className="text-sm text-gray-500">Updated: just now</div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
          <div className="text-xs text-gray-500">Total Bookings</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">1,234</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
          <div className="text-xs text-gray-500">Revenue</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">$56,780</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40">
          <div className="text-xs text-gray-500">Avg. Value</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">$46</div>
        </div>
      </div>

      <div className="mt-6 h-40 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400">
        Chart placeholder (install chart library to render real charts)
      </div>
    </div>
  );
}
