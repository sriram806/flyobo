"use client";

import React from "react";

export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 ${className}`}
    >
      {children}
    </span>
  );
}
