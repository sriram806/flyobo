"use client";

import Link from "next/link";
import WishlistButton from "../Wishlist/WishlistButton";

export default function PackageCard({ pkg, loading }) {
  const imgSrc = pkg?.images?.url || pkg?.image ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop";
  const currentPrice = Number(pkg?.price || 0);
  const originalPrice = Number(pkg?.estimatedPrice || 0);
  const hasDiscount = originalPrice > currentPrice && currentPrice > 0;
  const discountPct = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  return (
    <article
      className="group relative overflow-hidden rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
        ) : (
          <>
            <Link href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`} className="block h-full">
              <img src={imgSrc} alt={pkg?.title || "Package"} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} />
            </Link>
            {/* Wishlist Button */}
            <div className="absolute top-3 right-3">
              <WishlistButton 
                packageId={pkg?._id || pkg?.id} 
                size="sm"
                variant="default"
              />
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ) : (
          <>
            <Link
              href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
              className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:underline"
            >
              {pkg?.title}
            </Link>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">
              {pkg?.destination} • {pkg?.duration || 0} days
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                {hasDiscount && (
                  <div className="text-xs text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="text-rose-600 dark:text-rose-400 font-semibold">₹{currentPrice.toLocaleString("en-IN")}</div>
              </div>
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <div className="text-xs rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {discountPct}% OFF
                  </div>
                )}
                <div className="text-xs rounded-full px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  ★ {pkg?.rating || 4.5}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sky-600 dark:text-sky-400 font-semibold">Best Price</div>
              <Link
                href={`/packages/${pkg?.slug || pkg?.id || pkg?._id || "item"}`}
                className="inline-flex items-center rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700"
              >
                View Details →
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
