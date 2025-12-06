"use client";

import React from "react";

export default function Price({ price = 0, mrp = 0, hasDiscount = false, discountPct = 0 }) {
  return (
    <div>
      <div className="text-sm text-gray-600 dark:text-gray-400">Flyobo Price</div>
      <div className="flex items-baseline gap-3 mt-1">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">₹{Number(price).toLocaleString('en-IN')}</div>
        {hasDiscount && (
          <>
            <div className="text-sm text-gray-500 line-through">₹{Number(mrp).toLocaleString('en-IN')}</div>
            <div className="text-sm text-emerald-600">{discountPct}% OFF</div>
          </>
        )}
      </div>
      <div className="text-xs text-gray-500">Final Price <span className="font-medium text-gray-700 dark:text-gray-300">per person</span></div>
    </div>
  );
}
