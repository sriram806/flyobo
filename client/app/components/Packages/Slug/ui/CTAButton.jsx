"use client";

import React from "react";
import Link from "next/link";

export default function CTAButton({ href, onClick, children, variant = "primary", className = "" }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors";
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
  };

  if (href) {
    return (
      <Link href={href} className={`${base} ${styles[variant] || styles.primary} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${styles[variant] || styles.primary} ${className}`}>
      {children}
    </button>
  );
}
