"use client";
import React from "react";

export default function PackageDetailsPanel({ pkg }) {
  if (!pkg) return null;
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4">
      <div className="text-sm text-gray-600 dark:text-gray-300">Package Highlights</div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{pkg.title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{pkg.shortDescription || pkg.description || pkg.destination}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>Duration: {pkg.duration || "N/A"}</div>
        <div>Place: {pkg.destination || pkg.location || "N/A"}</div>
        <div>Starts from: ₹{Number(pkg.price || 0).toLocaleString("en-IN")}</div>
        <div>Seats: {pkg.seats || "Available"}</div>
      </div>
    </div>
  );
}
