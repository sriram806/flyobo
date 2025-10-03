"use client";

import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaTag } from "react-icons/fa";

export default function PackageListItem({ pkg, loading }) {
  const imgSrc =
    pkg?.images?.url ||
    pkg?.image ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format&fit=crop";

  const currentPrice = Number(pkg?.price || 0);
  const originalPrice = Number(pkg?.estimatedPrice || 0);
  const hasDiscount = originalPrice > currentPrice && currentPrice > 0;

  return (
    <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm hover:shadow-md transition">
      <div className="flex gap-3 sm:gap-4">
        <div className="w-32 h-24 sm:w-48 sm:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
          ) : (
            <img
              src={imgSrc}
              alt={pkg?.title || "Package"}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                  className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 hover:underline"
                >
                  {pkg?.title}
                </Link>
                <div className="text-right whitespace-nowrap">
                  {hasDiscount && (
                    <div className="text-xs text-gray-500 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </div>
                  )}
                  <div className="text-rose-600 dark:text-rose-400 font-semibold">
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                {pkg?.destination && (
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-500" size={12} />{" "}
                    {pkg.destination}
                  </span>
                )}
                <span>{pkg?.duration ?? pkg?.days ?? 0} days</span>
                <span className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" size={12} />{" "}
                  {pkg?.rating || 4.5}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {pkg?.tags && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FaTag size={12} /> {pkg.tags}
                  </div>
                )}
                <Link
                  href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                  className="inline-flex items-center rounded-lg bg-sky-600 text-white px-3 py-2 text-xs sm:text-sm hover:bg-sky-700 transition"
                >
                  View Details →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
